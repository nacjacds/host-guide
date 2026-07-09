import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { triggerWelcomeMessageTranslation } from "@/lib/translations/trigger";
import { geocodeAddress } from "@/lib/google-places";

const updatePropertySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  address: z.string().min(1).max(255).optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  host_tone: z.enum(["friendly", "formal"]).optional(),
  language: z.string().min(2).max(5).optional(),
  whatsapp_number: z.string().max(20).nullable().optional(),
  welcome_message: z.string().max(500).nullable().optional(),
  airbnb_url: z.string().max(500).nullable().optional(),
  bedrooms: z.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.number().int().min(0).max(50).nullable().optional(),
  max_guests: z.number().int().min(0).max(100).nullable().optional(),
  is_published: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = updatePropertySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updateData: typeof parsed.data & { lat?: number | null; lng?: number | null } = {
    ...parsed.data,
  };

  // Re-geocode whenever the address changes — local recommendation search
  // and distance calculations depend on having up-to-date coordinates.
  if (parsed.data.address !== undefined) {
    const coords = await geocodeAddress(parsed.data.address);
    updateData.lat = coords?.lat ?? null;
    updateData.lng = coords?.lng ?? null;
  }

  const { data: property, error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", id)
    .eq("host_id", user.id)
    .select()
    .single();

  if (error || !property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  if (parsed.data.welcome_message !== undefined) {
    triggerWelcomeMessageTranslation(property.id, property.welcome_message);
  }

  return NextResponse.json({ property });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
