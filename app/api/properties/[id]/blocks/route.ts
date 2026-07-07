import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { BlockType } from "@/types";

const BLOCK_DEFAULTS: Record<
  BlockType,
  { title: string; icon: string; content: Record<string, unknown> }
> = {
  wifi: { title: "WiFi", icon: "📶", content: { network_name: "", password: "" } },
  checkin: { title: "Check-in", icon: "🔑", content: { time: "", instructions: "" } },
  checkout: { title: "Check-out", icon: "🚪", content: { time: "", instructions: "" } },
  rules: { title: "Normas de la casa", icon: "📋", content: { rules: [] } },
  parking: { title: "Parking", icon: "🅿️", content: { rules: [] } },
  appliances: { title: "Electrodomésticos", icon: "🔌", content: { rules: [] } },
  pool: { title: "Piscina", icon: "🏊", content: { rules: [] } },
  restaurants: { title: "Dónde comer", icon: "🍽️", content: { places: [] } },
  drinks: { title: "Copas y bares", icon: "🍷", content: { places: [] } },
  nightlife: { title: "Ocio nocturno", icon: "🎵", content: { places: [] } },
  attractions: { title: "Qué visitar", icon: "🏛️", content: { places: [] } },
  custom: { title: "Bloque personalizado", icon: "📄", content: { text: "" } },
  emergencias: {
    title: "Emergencias",
    icon: "🆘",
    content: {
      general: "112",
      police: "",
      ambulance: "",
      firefighters: "",
      hospital: "",
      notes: "",
    },
  },
};

const createBlockSchema = z.object({
  type: z.enum([
    "wifi",
    "checkin",
    "checkout",
    "rules",
    "parking",
    "appliances",
    "custom",
    "emergencias",
    "pool",
    "restaurants",
    "drinks",
    "nightlife",
    "attractions",
  ]),
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

  const parsed = createBlockSchema.safeParse(await request.json());
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
    .from("guide_blocks")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { type } = parsed.data;
  const defaults = BLOCK_DEFAULTS[type];

  const { data: block, error } = await supabase
    .from("guide_blocks")
    .insert({
      property_id: propertyId,
      type,
      title: defaults.title,
      icon: defaults.icon,
      content: defaults.content,
      order_index: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ block }, { status: 201 });
}
