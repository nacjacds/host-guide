import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logAnalyticsEvent } from "@/lib/analytics";

// Only client-triggered events go through this endpoint. guide_opened and
// section_viewed are logged server-side during the page render instead
// (see lib/analytics.ts usages in app/guide).
const schema = z.object({
  property_id: z.string().uuid(),
  event_type: z.literal("whatsapp_clicked"),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await logAnalyticsEvent(parsed.data.property_id, parsed.data.event_type);
  return NextResponse.json({ ok: true });
}
