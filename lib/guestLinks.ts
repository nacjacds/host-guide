import { createServiceRoleClient } from "@/lib/supabase/server";
import { classifyGuideAvailability } from "@/lib/properties";
import type { Property } from "@/types";

export type GuestLinkStatus = "not_found" | "unpublished" | "deleted" | "expired" | "available";

export interface GuestLinkResolution {
  status: GuestLinkStatus;
  property?: Property;
  checkinDate?: string;
  checkoutDate?: string;
}

// Resolves a personalized guest-link token to its property + stay dates,
// classifying every reason a guest might not get the full guide — mirrors
// classifyGuideAvailability's shape (see lib/properties.ts) with one extra
// case (expired) layered on top. The token is checked first, before ever
// touching properties, so a bad/guessed token never triggers a property
// lookup at all.
export async function resolveGuestLink(token: string): Promise<GuestLinkResolution> {
  const supabase = createServiceRoleClient();

  const { data: link } = await supabase
    .from("guest_guide_links")
    .select("property_id, checkin_date, checkout_date")
    .eq("id", token)
    .maybeSingle();

  if (!link) return { status: "not_found" };

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", link.property_id)
    .single();

  const availability = classifyGuideAvailability(property);
  if (availability === "not_found") return { status: "not_found" };
  if (availability === "unpublished") return { status: "unpublished" };
  if (availability === "deleted") return { status: "deleted" };

  // Day-granularity comparison against the server's own UTC date — checkin/
  // checkout are plain `date` columns with no time zone of their own, so
  // this deliberately doesn't try to be precise about the property's local
  // time zone (out of scope for a coarse "which day is it" check).
  const today = new Date().toISOString().slice(0, 10);
  if (today > link.checkout_date) {
    return {
      status: "expired",
      property: property!,
      checkinDate: link.checkin_date,
      checkoutDate: link.checkout_date,
    };
  }

  return {
    status: "available",
    property: property!,
    checkinDate: link.checkin_date,
    checkoutDate: link.checkout_date,
  };
}
