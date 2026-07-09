import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  searchRecommendationCandidates,
  haversineDistanceMeters,
  getWalkingMinutes,
  geocodeAddress,
} from "@/lib/google-places";
import { curateRecommendations } from "@/lib/claude";
import {
  BASE_RECOMMENDATION_CATEGORIES,
  OPTIONAL_RECOMMENDATION_CATEGORIES,
  MAX_PLACES_PER_CATEGORY,
} from "./constants";
import type { PropertyRecommendation, PropertyRecommendationCategory } from "@/types";

const ALL_CATEGORIES = [...BASE_RECOMMENDATION_CATEGORIES, ...OPTIONAL_RECOMMENDATION_CATEGORIES];

// Generates (or regenerates) AI-curated recommendations. By default runs
// every category (used by the cron job and the "regenerate all" button in
// Settings) — pass `category` to regenerate just one section (used by the
// per-card "Generar con IA" button in the Editor), leaving every other
// category's rows untouched.
export async function generatePropertyRecommendations(
  propertyId: string,
  options?: { category?: PropertyRecommendationCategory }
): Promise<{
  categoriesDetected: PropertyRecommendationCategory[];
  recommendations: PropertyRecommendation[];
}> {
  const supabase = createServiceRoleClient();
  const categoriesToProcess = options?.category ? [options.category] : ALL_CATEGORIES;

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address, lat, lng")
    .eq("id", propertyId)
    .single();

  if (!property) throw new Error("Propiedad no encontrada");

  let center =
    property.lat != null && property.lng != null
      ? { lat: property.lat, lng: property.lng }
      : null;

  if (!center) {
    if (!property.address) throw new Error("La propiedad no tiene dirección configurada");
    center = await geocodeAddress(property.address);
    if (!center) throw new Error("No se pudo geocodificar la dirección de la propiedad");
    await supabase
      .from("properties")
      .update({ lat: center.lat, lng: center.lng })
      .eq("id", propertyId);
  }

  const categoriesFoundThisRun: PropertyRecommendationCategory[] = [];
  const newRows: Array<{
    property_id: string;
    category: PropertyRecommendationCategory;
    place_id: string;
    name: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
    distance_meters: number;
    distance_walking_minutes: number | null;
    maps_url: string;
    rating: number;
    photo_url: string | null;
    source: "ai_curated";
    display_order: number;
  }> = [];

  for (const category of categoriesToProcess) {
    const candidates = await searchRecommendationCandidates(center, category);
    if (candidates.length === 0) continue;

    const curated = await curateRecommendations({
      propertyName: property.name,
      address: property.address ?? "",
      category,
      candidates: candidates.map((c) => ({
        place_id: c.place_id,
        name: c.name,
        rating: c.rating,
        user_ratings_total: c.user_ratings_total,
        types: c.types,
      })),
      limit: MAX_PLACES_PER_CATEGORY,
    });

    const selected = curated
      .map((c) => {
        const place = candidates.find((p) => p.place_id === c.place_id);
        return place ? { place, description: c.description } : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (selected.length === 0) continue;

    const walkingMinutes = await getWalkingMinutes(
      center,
      selected.map((s) => s.place.location)
    );

    selected.forEach(({ place, description }, i) => {
      newRows.push({
        property_id: propertyId,
        category,
        place_id: place.place_id,
        name: place.name,
        description,
        address: place.address,
        lat: place.location.lat,
        lng: place.location.lng,
        distance_meters: haversineDistanceMeters(center!, place.location),
        distance_walking_minutes: walkingMinutes[i],
        maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        rating: place.rating,
        photo_url: place.photo_url,
        source: "ai_curated",
        display_order: i,
      });
    });

    categoriesFoundThisRun.push(category);
  }

  // Only ever replace ai_curated rows for the category/categories just
  // processed — manually-added places, and other untouched categories'
  // rows, are never affected.
  let deleteQuery = supabase
    .from("property_recommendations")
    .delete()
    .eq("property_id", propertyId)
    .eq("source", "ai_curated");
  if (options?.category) {
    deleteQuery = deleteQuery.eq("category", options.category);
  } else {
    deleteQuery = deleteQuery.in("category", ALL_CATEGORIES);
  }
  await deleteQuery;

  let insertedRows: PropertyRecommendation[] = [];
  if (newRows.length > 0) {
    const { data } = await supabase.from("property_recommendations").insert(newRows).select();
    insertedRows = data ?? [];
  }

  const { data: existingMeta } = await supabase
    .from("property_recommendation_meta")
    .select("categories_detected")
    .eq("property_id", propertyId)
    .maybeSingle();

  // Merge: keep detected status for categories not touched this run:
  // drop categoriesToProcess from the existing set, then add back whichever
  // of those actually found results this time.
  const categoriesDetected = Array.from(
    new Set(
      (existingMeta?.categories_detected ?? [])
        .filter((c) => !categoriesToProcess.includes(c))
        .concat(categoriesFoundThisRun)
    )
  );

  await supabase.from("property_recommendation_meta").upsert({
    property_id: propertyId,
    last_generated_at: new Date().toISOString(),
    categories_detected: categoriesDetected,
  });

  return { categoriesDetected, recommendations: insertedRows };
}
