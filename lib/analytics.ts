import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { AnalyticsEventType } from "@/types";

export async function logAnalyticsEvent(
  propertyId: string,
  eventType: AnalyticsEventType,
  section?: string
) {
  try {
    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country");
    const supabase = createServiceRoleClient();
    await supabase.from("analytics_events").insert({
      property_id: propertyId,
      event_type: eventType,
      section: section ?? null,
      country: country ?? null,
    });
  } catch {
    // Analytics must never break the guide for a guest.
  }
}
