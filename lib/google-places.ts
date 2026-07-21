import fs from "fs";
import type { DestinationType, PropertyRecommendationCategory } from "@/types";

// Every call in this file runs server-side only (this module has no
// browser consumers — the manual-search/autocomplete UI hits our own API
// routes, which call these functions from the server), so it uses
// GOOGLE_MAPS_SERVER_KEY: an IP-restricted key. A domain/referrer-restricted
// key doesn't work here since server-to-server requests carry no Referer
// header.
const PLACES_API_BASE = "https://places.googleapis.com/v1/places";
const GEOCODING_API_BASE = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_MATRIX_API_BASE = "https://maps.googleapis.com/maps/api/distancematrix/json";

export interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  types: string[];
  location: { lat: number; lng: number };
  maps_url: string;
  photo_url: string | null;
  photo_urls: string[];
}

// Google's Text Search / Place Details responses already return every
// photo reference in the same call as everything else — no extra API cost
// to keep more than the first. Capped just to keep the array (and the
// lightbox it feeds) reasonably sized.
const MAX_PHOTOS_PER_PLACE = 5;

const CATEGORY_QUERY: Record<string, string> = {
  supermarket: "supermercados",
  pharmacy: "farmacias",
  transport: "transporte público",
};

// Text query + search radius (meters) for each of the 5 AI-curated local
// recommendation categories. attractions/restaurants/nightlife are always
// searched; beaches/nature use a wider radius and are only kept as a
// category for the property if the search actually returns results.
export const RECOMMENDATION_CATEGORY_CONFIG: Record<
  PropertyRecommendationCategory,
  { query: string; radiusMeters: number }
> = {
  attractions: { query: "atracciones turísticas y lugares de interés", radiusMeters: 5000 },
  restaurants: { query: "restaurantes", radiusMeters: 2000 },
  nightlife: { query: "bares y vida nocturna", radiusMeters: 2000 },
  beaches: { query: "playas", radiusMeters: 15000 },
  nature: { query: "parques naturales y naturaleza", radiusMeters: 15000 },
};

// Extra Google Places (New) Table A types searched via Nearby Search — one
// additional call, merged with the "attractions" category's existing text
// search — when a property's destination_type isn't the "urban" default.
// This is purely additive (see searchRecommendationCandidates): the
// existing generic query always still runs too, so nothing is ever
// excluded, only supplemented with candidates a broad text query alone
// was letting well-known but out-competed landmarks (e.g. a cathedral
// against restaurants with thousands of reviews) fall through.
// "urban" and, deliberately, "rural"/"nature" combined (no differentiation
// between them yet) map straight from the approved product proposal.
export const DESTINATION_TYPE_ATTRACTION_TYPES: Record<DestinationType, string[]> = {
  urban: [],
  historic_city: ["historical_landmark", "museum", "church", "monument", "castle"],
  beach: ["beach", "marina"],
  nature: ["hiking_area", "scenic_spot"],
  rural: ["hiking_area", "scenic_spot"],
};

// "Paseo marítimo" (seafront promenade) has no dedicated Google Places
// type, so beach properties get one extra free-text search for it instead
// of/alongside the Nearby Search type list above.
const DESTINATION_TYPE_EXTRA_TEXT_QUERY: Partial<Record<DestinationType, string>> = {
  beach: "paseo marítimo",
};

function buildPhotoUrl(photoName: string | undefined): string | null {
  if (!photoName) return null;
  return `/api/places/photo?name=${encodeURIComponent(photoName)}`;
}

function buildPhotoUrls(photos: Array<{ name: string }> | undefined): string[] {
  return (photos ?? [])
    .slice(0, MAX_PHOTOS_PER_PLACE)
    .map((p) => buildPhotoUrl(p.name))
    .filter((url): url is string => url !== null);
}

const EARTH_RADIUS_METERS = 6371000;

// Places API (New) Text Search's `locationRestriction` only accepts a
// rectangle (viewport), not a circle — this approximates our radius as the
// smallest rectangle that circumscribes it, so real hard-restriction
// (locationRestriction) can still be used instead of locationBias, which
// Google treats as a weak preference and can ignore entirely for
// well-known places far outside it (see the 90-140km outliers this was
// fixed for). The one tradeoff: points in the rectangle's corners can be
// up to radius*sqrt(2) from center, not just radius — still far tighter
// than the previous unenforced behavior.
function boundingRectangleFromCircle(center: { lat: number; lng: number }, radiusMeters: number) {
  const latDelta = (radiusMeters / EARTH_RADIUS_METERS) * (180 / Math.PI);
  const lngDelta =
    (radiusMeters / (EARTH_RADIUS_METERS * Math.cos((center.lat * Math.PI) / 180))) *
    (180 / Math.PI);

  return {
    low: { latitude: center.lat - latDelta, longitude: center.lng - lngDelta },
    high: { latitude: center.lat + latDelta, longitude: center.lng + lngDelta },
  };
}

export async function searchNearbyPlaces(
  address: string,
  category: string
): Promise<PlaceResult[]> {
  const query = `${CATEGORY_QUERY[category] ?? category} cerca de ${address}`;

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.types,places.photos",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "es" }),
  });

  if (!response.ok) {
    // TEMPORARY diagnostic logging — Places API (New) returns a JSON body
    // like { error: { code, message, status } } explaining the real cause
    // (e.g. PERMISSION_DENIED) — the generic "Google Places API error:
    // 403" thrown below was hiding it.
    const bodyText = await response.text().catch(() => "<no body>");
    const logData = { httpStatus: response.status, body: bodyText, query };
    console.error("[searchNearbyPlaces] HTTP error", logData);
    fs.appendFileSync(
      "/tmp/debug.log",
      `${new Date().toISOString()} - [searchNearbyPlaces HTTP error] ${JSON.stringify(logData)}\n`
    );
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();
  return mapPlacesResponse(data);
}

const PLACE_FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.types,places.photos";

// Best-effort supplemental search — used only to add destination_type-aware
// candidates on top of the always-run generic query below, so a failure
// here (network blip, API error) should never break generation outright.
// Returns raw (unfiltered) places, same shape as Text Search's response.
async function fetchNearbySearchRawPlaces(
  center: { lat: number; lng: number },
  radiusMeters: number,
  includedTypes: string[]
): Promise<RawPlaceWithId[]> {
  try {
    const response = await fetch(`${PLACES_API_BASE}:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
        "X-Goog-FieldMask": PLACE_FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 20,
        rankPreference: "POPULARITY",
        locationRestriction: {
          circle: {
            center: { latitude: center.lat, longitude: center.lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "<no body>");
      console.error("[fetchNearbySearchRawPlaces] HTTP error", {
        httpStatus: response.status,
        body: bodyText,
        includedTypes,
        center,
      });
      return [];
    }

    const data = await response.json();
    return data.places ?? [];
  } catch (err) {
    console.error("[fetchNearbySearchRawPlaces] request failed", { err, includedTypes, center });
    return [];
  }
}

// Same best-effort reasoning as fetchNearbySearchRawPlaces above — used
// for destination-type text queries with no matching Google Places type
// (e.g. "paseo marítimo", which isn't a Table A type).
async function fetchTextSearchRawPlaces(
  query: string,
  rectangle: ReturnType<typeof boundingRectangleFromCircle>
): Promise<RawPlaceWithId[]> {
  try {
    const response = await fetch(`${PLACES_API_BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
        "X-Goog-FieldMask": PLACE_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "es",
        locationRestriction: { rectangle },
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "<no body>");
      console.error("[fetchTextSearchRawPlaces] HTTP error", {
        httpStatus: response.status,
        body: bodyText,
        query,
      });
      return [];
    }

    const data = await response.json();
    return data.places ?? [];
  } catch (err) {
    console.error("[fetchTextSearchRawPlaces] request failed", { err, query });
    return [];
  }
}

// Searches a recommendation category (attractions/restaurants/nightlife/
// beaches/nature) centered on real coordinates, hard-restricted to a
// rectangle circumscribing the category's radius — locationBias (a weak
// preference Google can ignore for well-known places far outside it) was
// letting results 90-140km away through for generic queries like
// "atracciones turísticas", so this uses locationRestriction instead,
// which Text Search (New) only supports as a rectangle, not a circle.
//
// For "attractions" on a non-"urban" destination_type, this generic query
// always still runs (unchanged), and is then supplemented — never
// replaced — with destination-type-aware candidates (see
// DESTINATION_TYPE_ATTRACTION_TYPES/DESTINATION_TYPE_EXTRA_TEXT_QUERY
// above), deduped by place_id before the rating/review filter runs. Every
// other category, and "urban" (the default every existing property keeps
// until reclassified), is byte-for-byte the same single call as before.
export async function searchRecommendationCandidates(
  center: { lat: number; lng: number },
  category: PropertyRecommendationCategory,
  destinationType: DestinationType = "urban"
): Promise<PlaceResult[]> {
  const config = RECOMMENDATION_CATEGORY_CONFIG[category];
  const rectangle = boundingRectangleFromCircle(center, config.radiusMeters);

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
      "X-Goog-FieldMask": PLACE_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: config.query,
      languageCode: "es",
      locationRestriction: { rectangle },
    }),
  });

  if (!response.ok) {
    // TEMPORARY diagnostic logging — same reasoning as searchNearbyPlaces
    // above: capture Google's actual error body instead of just the
    // generic HTTP status.
    const bodyText = await response.text().catch(() => "<no body>");
    const logData = { httpStatus: response.status, body: bodyText, category, center };
    console.error("[searchRecommendationCandidates] HTTP error", logData);
    fs.appendFileSync(
      "/tmp/debug.log",
      `${new Date().toISOString()} - [searchRecommendationCandidates HTTP error] ${JSON.stringify(logData)}\n`
    );
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();
  const rawPlacesCombined: RawPlaceWithId[] = data.places ?? [];

  // Additive destination-type candidates — "attractions" only, and only
  // when this property was classified as something other than "urban".
  if (category === "attractions" && destinationType !== "urban") {
    const extraTypes = DESTINATION_TYPE_ATTRACTION_TYPES[destinationType];
    const extraQuery = DESTINATION_TYPE_EXTRA_TEXT_QUERY[destinationType];

    const [nearbyExtras, textExtras] = await Promise.all([
      extraTypes.length > 0
        ? fetchNearbySearchRawPlaces(center, config.radiusMeters, extraTypes)
        : Promise.resolve([]),
      extraQuery ? fetchTextSearchRawPlaces(extraQuery, rectangle) : Promise.resolve([]),
    ]);

    const seenIds = new Set(rawPlacesCombined.map((p) => p.id));
    for (const extra of [...nearbyExtras, ...textExtras]) {
      if (!seenIds.has(extra.id)) {
        seenIds.add(extra.id);
        rawPlacesCombined.push(extra);
      }
    }
  }

  // TEMPORARY diagnostic logging — dumps every raw candidate Google Places
  // returned, before our own rating/review-count filter runs (see
  // mapPlacesResponse below), so we can tell whether well-known landmarks
  // are missing from Google's response itself vs. getting filtered out
  // downstream (by us or by Claude's curation).
  const rawPlaces = rawPlacesCombined.map((p: RawPlace) => ({
    name: p.displayName?.text,
    rating: p.rating,
    user_ratings_total: p.userRatingCount,
    types: p.types,
    location: p.location,
  }));
  const rawLog = {
    category,
    center,
    destinationType,
    query: config.query,
    radiusMeters: config.radiusMeters,
    rectangle,
    rawCount: rawPlaces.length,
    rawPlaces,
  };
  console.error("[searchRecommendationCandidates] raw Google Places results", rawLog);
  fs.appendFileSync(
    "/tmp/debug.log",
    `${new Date().toISOString()} - [searchRecommendationCandidates raw] ${JSON.stringify(rawLog)}\n`
  );

  const filtered = mapPlacesResponse({ places: rawPlacesCombined });

  // TEMPORARY diagnostic logging — same candidates as above, after the
  // rating >= 4.0 / reviews >= 50 filter, so a diff between this and the
  // raw list above shows exactly what that filter removed.
  const filteredLog = {
    category,
    center,
    filteredCount: filtered.length,
    filtered: filtered.map((p) => ({
      name: p.name,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total,
    })),
  };
  console.error("[searchRecommendationCandidates] after rating/review filter", filteredLog);
  fs.appendFileSync(
    "/tmp/debug.log",
    `${new Date().toISOString()} - [searchRecommendationCandidates filtered] ${JSON.stringify(filteredLog)}\n`
  );

  return filtered;
}

interface RawPlace {
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  location?: { latitude: number; longitude: number };
}

// Same Place resource shape returned by both Text Search (New) and Nearby
// Search (New) — both New Places API endpoints share this response format,
// so one type/mapper covers results from either.
interface RawPlaceWithId {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  location: { latitude: number; longitude: number };
  googleMapsUri: string;
  types?: string[];
  photos?: Array<{ name: string }>;
}

function mapPlacesResponse(data: { places?: RawPlaceWithId[] }): PlaceResult[] {
  const places = data.places ?? [];

  return places
    .filter((p) => (p.rating ?? 0) >= 4.0 && (p.userRatingCount ?? 0) >= 50)
    .map((p) => ({
      place_id: p.id,
      name: p.displayName.text,
      address: p.formattedAddress,
      rating: p.rating ?? 0,
      user_ratings_total: p.userRatingCount ?? 0,
      types: p.types ?? [],
      location: { lat: p.location.latitude, lng: p.location.longitude },
      maps_url: p.googleMapsUri,
      photo_url: buildPhotoUrl(p.photos?.[0]?.name),
      photo_urls: buildPhotoUrls(p.photos),
    }));
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL(GEOCODING_API_BASE);
  url.searchParams.set("address", address);
  url.searchParams.set("key", process.env.GOOGLE_MAPS_SERVER_KEY!);
  url.searchParams.set("language", "es");

  const response = await fetch(url);
  if (!response.ok) {
    // TEMPORARY diagnostic logging — remove once geocoding failures are
    // understood. Google's Geocoding API almost always returns HTTP 200
    // even for API-level errors, so this branch (non-2xx) is the less
    // likely path, but log it fully just in case.
    const bodyText = await response.text().catch(() => "<no body>");
    const data = { httpStatus: response.status, body: bodyText, address };
    console.error("[geocodeAddress] HTTP error", data);
    // TEMPORARY fallback logging — console output isn't showing up in
    // production container logs, so also write directly to a file we can
    // `cat` from inside the container.
    fs.appendFileSync(
      "/tmp/debug.log",
      `${new Date().toISOString()} - [geocodeAddress HTTP error] ${JSON.stringify(data)}\n`
    );
    return null;
  }

  const data = await response.json();
  const location = data.results?.[0]?.geometry?.location;
  if (!location) {
    // TEMPORARY diagnostic logging — remove once geocoding failures are
    // understood. Google returns HTTP 200 with a `status` field
    // (REQUEST_DENIED, ZERO_RESULTS, INVALID_REQUEST, OVER_QUERY_LIMIT,
    // etc.) and often an `error_message` explaining why — this is almost
    // certainly where the real cause is.
    const logData = {
      status: data.status,
      error_message: data.error_message,
      address,
      fullResponse: data,
    };
    console.error("[geocodeAddress] No location in response", logData);
    // TEMPORARY fallback logging — see note above.
    fs.appendFileSync(
      "/tmp/debug.log",
      `${new Date().toISOString()} - [geocodeAddress no location] ${JSON.stringify(logData)}\n`
    );
    return null;
  }

  return { lat: location.lat, lng: location.lng };
}

// Walking distance/duration in a single batch call per category (Distance
// Matrix supports up to 25 destinations per request, well above our
// max-10-per-category cap). Falls back to null minutes (haversine distance
// is still used) if the API call fails — never blocks generation.
export async function getWalkingMinutes(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[]
): Promise<(number | null)[]> {
  if (destinations.length === 0) return [];

  const url = new URL(DISTANCE_MATRIX_API_BASE);
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.set(
    "destinations",
    destinations.map((d) => `${d.lat},${d.lng}`).join("|")
  );
  url.searchParams.set("mode", "walking");
  url.searchParams.set("key", process.env.GOOGLE_MAPS_SERVER_KEY!);

  try {
    const response = await fetch(url);
    if (!response.ok) return destinations.map(() => null);

    const data = await response.json();
    const elements = data.rows?.[0]?.elements ?? [];
    return elements.map((el: { status: string; duration?: { value: number } }) =>
      el.status === "OK" && el.duration ? Math.round(el.duration.value / 60) : null
    );
  } catch {
    return destinations.map(() => null);
  }
}

export interface PlaceAutocompleteSuggestion {
  place_id: string;
  description: string;
}

// Powers the "+ Añadir lugar manualmente" search in the editor — biased
// toward the property's location so results are relevant.
export async function autocompletePlaces(
  input: string,
  center: { lat: number; lng: number }
): Promise<PlaceAutocompleteSuggestion[]> {
  const response = await fetch(`${PLACES_API_BASE}:autocomplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
    },
    body: JSON.stringify({
      input,
      languageCode: "es",
      locationBias: {
        circle: { center: { latitude: center.lat, longitude: center.lng }, radius: 20000 },
      },
    }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  const suggestions = (data.suggestions ?? []) as Array<{
    placePrediction?: { placeId: string; text: { text: string } };
  }>;

  return suggestions
    .filter((s): s is { placePrediction: NonNullable<typeof s.placePrediction> } => !!s.placePrediction)
    .map((s) => ({
      place_id: s.placePrediction.placeId,
      description: s.placePrediction.text.text,
    }));
}

// Fetches full factual data for a single place — used when a host manually
// adds a place via autocomplete, so the row is grounded in real Google data
// just like AI-curated ones (never the host's freehand typing).
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const response = await fetch(`${PLACES_API_BASE}/${placeId}?languageCode=es`, {
    headers: {
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_SERVER_KEY!,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,rating,userRatingCount,location,googleMapsUri,types,photos",
    },
  });

  if (!response.ok) return null;

  const p = await response.json();
  if (!p.id || !p.location) return null;

  return {
    place_id: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    rating: p.rating ?? 0,
    user_ratings_total: p.userRatingCount ?? 0,
    types: p.types ?? [],
    location: { lat: p.location.latitude, lng: p.location.longitude },
    maps_url: p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    photo_url: buildPhotoUrl(p.photos?.[0]?.name),
    photo_urls: buildPhotoUrls(p.photos),
  };
}

export function haversineDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
