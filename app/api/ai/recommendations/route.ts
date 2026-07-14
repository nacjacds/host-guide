import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { searchNearbyPlaces } from "@/lib/google-places";
import { generateRecommendationDescriptions } from "@/lib/claude";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const requestSchema = z.object({
  propertyId: z.string().uuid(),
  category: z.enum(["supermarket", "pharmacy", "transport"]),
  guestProfile: z.string().max(280).default("huéspedes turísticos"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free") {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Las recomendaciones con IA requieren un plan de pago",
          "AI recommendations require a paid plan"
        ),
      },
      { status: 403 }
    );
  }

  const { propertyId, category, guestProfile } = parsed.data;

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const places = await searchNearbyPlaces(property.address ?? "", category);
  const top5 = places.slice(0, 5);

  const descriptions = await generateRecommendationDescriptions({
    propertyName: property.name,
    address: property.address ?? "",
    guestProfile,
    category,
    places: top5,
  });

  const recommendationsToInsert = descriptions
    .map((desc) => {
      const place = top5.find((p) => p.place_id === desc.place_id);
      if (!place) return null;
      return {
        property_id: property.id,
        category,
        name: place.name,
        description: desc.description,
        address: place.address,
        google_place_id: place.place_id,
        rating: place.rating,
        maps_url: place.maps_url,
        is_ai_generated: true,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const { data: recommendations, error } = await supabase
    .from("recommendations")
    .insert(recommendationsToInsert)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recommendations });
}
