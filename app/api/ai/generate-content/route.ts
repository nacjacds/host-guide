import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateGuideContent } from "@/lib/claude";
import { triggerBlockTranslation } from "@/lib/translations/trigger";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";
import type { Database } from "@/types";

type GuideBlockInsert = Database["public"]["Tables"]["guide_blocks"]["Insert"];

const requestSchema = z.object({ propertyId: z.string().uuid() });

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
          "La generación de contenido con IA requiere un plan de pago",
          "AI content generation requires a paid plan"
        ),
      },
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
    return notFoundResponse(request, supabase, user.id, "property");
  }

  const content = await generateGuideContent({
    name: property.name,
    address: property.address ?? "",
    hostTone: property.host_tone,
  });

  // Seeded in the host's active dashboard locale (same mechanism as
  // getApiLocale everywhere else) rather than always Spanish — same bug
  // class as the block-title-locale fix for new guide_blocks (see
  // app/api/properties/[id]/blocks/route.ts). "Check-in"/"Check-out" stay
  // as-is: those words are identical in both locales throughout the app.
  const locale = await getApiLocale(request, supabase, user.id);
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
      title: pick(locale, "Normas de la casa", "House rules"),
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

  for (const block of blocks ?? []) {
    triggerBlockTranslation({
      propertyId: property.id,
      blockType: block.type,
      blockId: block.id,
      title: block.title,
      content: block.content,
    });
  }

  return NextResponse.json({
    welcome_message: content.welcome_message,
    neighborhood_description: content.neighborhood_description,
    blocks,
  });
}
