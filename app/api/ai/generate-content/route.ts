import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateGuideContent } from "@/lib/claude";
import type { Database } from "@/types";

type GuideBlockInsert = Database["public"]["Tables"]["guide_blocks"]["Insert"];

const requestSchema = z.object({ propertyId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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
    return NextResponse.json(
      { error: "La generación de contenido con IA requiere un plan de pago" },
      { status: 403 }
    );
  }

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", parsed.data.propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const content = await generateGuideContent({
    name: property.name,
    address: property.address ?? "",
    hostTone: property.host_tone,
  });

  const blocksToInsert: GuideBlockInsert[] = [
    {
      property_id: property.id,
      type: "checkin",
      title: "Check-in",
      icon: "🔑",
      content: { tips: content.checkin_tips },
      order_index: 0,
    },
    {
      property_id: property.id,
      type: "checkout",
      title: "Check-out",
      icon: "🚪",
      content: { tips: content.checkout_tips },
      order_index: 1,
    },
    {
      property_id: property.id,
      type: "rules",
      title: "Normas de la casa",
      icon: "📋",
      content: { rules: content.rules },
      order_index: 2,
    },
  ];

  const { data: blocks, error } = await supabase
    .from("guide_blocks")
    .insert(blocksToInsert)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    welcome_message: content.welcome_message,
    neighborhood_description: content.neighborhood_description,
    blocks,
  });
}
