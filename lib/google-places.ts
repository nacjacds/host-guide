const PLACES_API_BASE = "https://places.googleapis.com/v1/places";

export interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  location: { lat: number; lng: number };
  maps_url: string;
}

const CATEGORY_QUERY: Record<string, string> = {
  restaurant: "restaurantes",
  bar: "bares",
  supermarket: "supermercados",
  pharmacy: "farmacias",
  transport: "transporte público",
  activity: "actividades y ocio",
};

export async function searchNearbyPlaces(
  address: string,
  category: string
): Promise<PlaceResult[]> {
  const query = `${CATEGORY_QUERY[category] ?? category} cerca de ${address}`;

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "es" }),
  });

  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();
  const places = (data.places ?? []) as Array<{
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    location: { latitude: number; longitude: number };
    googleMapsUri: string;
  }>;

  return places
    .filter((p) => (p.rating ?? 0) >= 4.0 && (p.userRatingCount ?? 0) >= 50)
    .map((p) => ({
      place_id: p.id,
      name: p.displayName.text,
      address: p.formattedAddress,
      rating: p.rating ?? 0,
      user_ratings_total: p.userRatingCount ?? 0,
      location: { lat: p.location.latitude, lng: p.location.longitude },
      maps_url: p.googleMapsUri,
    }));
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
