import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getPlaceDetails, haversineDistanceMeters, getWalkingMinutes } from "@/lib/google-places";
import { describeManualPlace } from "@/lib/claude";
import { triggerRecommendationsTranslation } from "@/lib/translations/translateRecommendations";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const addPlaceSchema = z.object({
  category: z.enum(["attractions", "restaurants", "nightlife", "beaches", "nature"]),
  place_id: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = addPlaceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address, lat, lng")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const place = await getPlaceDetails(parsed.data.place_id);
  if (!place) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se encontró ese lugar en Google", "Couldn't find that place on Google") },
      { status: 404 }
    );
  }

  const center = property.lat != null && property.lng != null
    ? { lat: property.lat, lng: property.lng }
    : null;

  const distanceMeters = center ? haversineDistanceMeters(center, place.location) : null;
  const walkingMinutes = center ? (await getWalkingMinutes(center, [place.location]))[0] : null;

  const { count } = await supabase
    .from("property_recommendations")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("category", parsed.data.category);

  // Best-effort — a manually added place should still get saved even if
  // Claude fails or is slow, just without a description (same as before).
  const description = await describeManualPlace({
    propertyName: property.name,
    address: property.address ?? "",
    category: parsed.data.category,
    place: {
      place_id: place.place_id,
      name: place.name,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
    },
  }).catch((err) => {
    console.error("[property-recommendations] describeManualPlace failed", err);
    return null;
  });

  const { data: recommendation, error } = await supabase
    .from("property_recommendations")
    .insert({
      property_id: propertyId,
      category: parsed.data.category,
      place_id: place.place_id,
      name: place.name,
      description,
      address: place.address,
      lat: place.location.lat,
      lng: place.location.lng,
      distance_meters: distanceMeters,
      distance_walking_minutes: walkingMinutes,
      maps_url: place.maps_url,
      rating: place.rating || null,
      photo_url: place.photo_url,
      photo_urls: place.photo_urls,
      source: "manual",
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (description) {
    const { data: categoryRows } = await supabase
      .from("property_recommendations")
      .select("id, description")
      .eq("property_id", propertyId)
      .eq("category", parsed.data.category);
    triggerRecommendationsTranslation(propertyId, parsed.data.category, categoryRows ?? []);
  }

  return NextResponse.json({ recommendation }, { status: 201 });
}
