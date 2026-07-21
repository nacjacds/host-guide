import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/clientIp";
import { lookupGeoLocation } from "@/lib/geoip";
import type { AnalyticsEventType } from "@/types";

// The guest's IP is used here purely ephemerally, within this one
// function call — to check it against the host's excluded-IP list and to
// derive city/country (lib/geoip.ts) — and is never written to
// analytics_events or any other persistent storage.
export async function logAnalyticsEvent(
  propertyId: string,
  eventType: AnalyticsEventType,
  section?: string
) {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const supabase = createServiceRoleClient();

    if (ip) {
      const { data: excluded } = await supabase
        .from("analytics_excluded_ips")
        .select("id")
        .eq("ip_address", ip)
        .maybeSingle();
      // Host's own visit (or any other excluded IP) — skip entirely, not
      // counted as a visit, no country/city derived or stored.
      if (excluded) return;
    }

    const { country, city } = ip ? await lookupGeoLocation(ip) : { country: null, city: null };

    await supabase.from("analytics_events").insert({
      property_id: propertyId,
      event_type: eventType,
      section: section ?? null,
      country,
      city,
    });
  } catch {
    // Analytics must never break the guide for a guest.
  }
}
