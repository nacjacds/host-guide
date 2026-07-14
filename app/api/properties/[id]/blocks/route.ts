import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import type { BlockType } from "@/types";

// Title comes from dashboard.editor.toolbar (messages/{es,en}.json) — same
// labels shown in the block-creation toolbar — so a new block's initial
// title matches the host's active dashboard locale instead of always
// seeding Spanish. Icon and content shape never vary by locale.
const BLOCK_DEFAULTS: Record<BlockType, { icon: string; content: Record<string, unknown> }> = {
  wifi: { icon: "📶", content: { network_name: "", password: "" } },
  checkin: { icon: "🔑", content: { time: "", instructions: "" } },
  checkout: { icon: "🚪", content: { time: "", instructions: "" } },
  rules: { icon: "📋", content: { rules: [] } },
  parking: { icon: "🅿️", content: { rules: [] } },
  appliances: { icon: "🔌", content: { rules: [] } },
  pool: { icon: "🏊", content: { rules: [] } },
  drinks: { icon: "🍷", content: { places: [] } },
  custom: { icon: "📄", content: { text: "" } },
  emergencias: {
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
    "drinks",
  ]),
  locale: z.enum(["es", "en"]).optional(),
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
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const { count } = await supabase
    .from("guide_blocks")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { type, locale } = parsed.data;
  const defaults = BLOCK_DEFAULTS[type];
  const messages = locale === "en" ? enMessages : esMessages;
  const title = messages.dashboard.editor.toolbar[type];

  const { data: block, error } = await supabase
    .from("guide_blocks")
    .insert({
      property_id: propertyId,
      type,
      title,
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
