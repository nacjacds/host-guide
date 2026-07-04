import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createRecommendationSchema = z.object({
  category: z.enum([
    "restaurant",
    "bar",
    "supermarket",
    "pharmacy",
    "transport",
    "activity",
  ]),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  address: z.string().max(255).optional(),
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
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = createRecommendationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const { count } = await supabase
    .from("recommendations")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { data: recommendation, error } = await supabase
    .from("recommendations")
    .insert({
      property_id: propertyId,
      ...parsed.data,
      is_ai_generated: false,
      order_index: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recommendation }, { status: 201 });
}
