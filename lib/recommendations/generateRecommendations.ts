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
import type { PropertyRecommendationCategory } from "@/types";

const ALL_CATEGORIES = [...BASE_RECOMMENDATION_CATEGORIES, ...OPTIONAL_RECOMMENDATION_CATEGORIES];

export async function generatePropertyRecommendations(propertyId: string): Promise<{
  categoriesDetected: PropertyRecommendationCategory[];
}> {
  const supabase = createServiceRoleClient();

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

  const categoriesDetected: PropertyRecommendationCategory[] = [];
  const newRows: Array<{
    property_id: string;
    category: PropertyRecommendationCategory;
    place_id: string;
    name: string;
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

  for (const category of ALL_CATEGORIES) {
    const candidates = await searchRecommendationCandidates(center, category);
    if (candidates.length === 0) continue;

    const selectedIds = await curateRecommendations({
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

    const selectedPlaces = selectedIds
      .map((id) => candidates.find((c) => c.place_id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    if (selectedPlaces.length === 0) continue;

    const walkingMinutes = await getWalkingMinutes(
      center,
      selectedPlaces.map((p) => p.location)
    );

    selectedPlaces.forEach((place, i) => {
      newRows.push({
        property_id: propertyId,
        category,
        place_id: place.place_id,
        name: place.name,
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

    categoriesDetected.push(category);
  }

  // Only ever replace ai_curated rows — manually-added places are never
  // touched by (re)generation.
  await supabase
    .from("property_recommendations")
    .delete()
    .eq("property_id", propertyId)
    .eq("source", "ai_curated");

  if (newRows.length > 0) {
    await supabase.from("property_recommendations").insert(newRows);
  }

  await supabase.from("property_recommendation_meta").upsert({
    property_id: propertyId,
    last_generated_at: new Date().toISOString(),
    categories_detected: categoriesDetected,
  });

  return { categoriesDetected };
}
