import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, type YCloudInboundWebhook } from "@/lib/whatsapp/ycloud";
import { buildSystemPrompt } from "@/lib/whatsapp/bot";
import { askBot } from "@/lib/claude";
import type { BotMessage } from "@/types";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as YCloudInboundWebhook;

  const inbound = payload.whatsappInboundMessage;
  if (!inbound?.text?.body) {
    return NextResponse.json({ ok: true });
  }

  const guestPhone = inbound.from;
  const supabase = createServiceRoleClient();

  // All properties on the Pro plan share the same YCloud bot number, so the
  // inbound webhook alone can't identify the property — a guest is routed by
  // an existing conversation started from their property's guide link
  // (e.g. wa.me/<ycloud-number>?text=<property-code>). Until that first-touch
  // flow exists, we can only continue conversations already on record.
  const { data: conversation } = await supabase
    .from("bot_conversations")
    .select("*")
    .eq("guest_phone", guestPhone)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ ok: true });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", conversation.property_id)
    .single();

  if (!property) {
    return NextResponse.json({ ok: true });
  }

  const [{ data: blocks }, { data: recommendations }] = await Promise.all([
    supabase
      .from("guide_blocks")
      .select("*")
      .eq("property_id", property.id)
      .eq("is_visible", true),
    supabase
      .from("recommendations")
      .select("*")
      .eq("property_id", property.id)
      .eq("is_visible", true),
  ]);

  const systemPrompt = buildSystemPrompt(property, blocks ?? [], recommendations ?? []);
  const reply = await askBot(systemPrompt, inbound.text.body);

  await sendWhatsAppMessage(guestPhone, reply);

  const newMessages: BotMessage[] = [
    ...conversation.messages,
    { role: "user", content: inbound.text.body, timestamp: new Date().toISOString() },
    { role: "assistant", content: reply, timestamp: new Date().toISOString() },
  ];

  await supabase
    .from("bot_conversations")
    .update({ messages: newMessages })
    .eq("id", conversation.id);

  return NextResponse.json({ ok: true });
}
