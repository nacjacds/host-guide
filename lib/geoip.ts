// Derives approximate city/country from an IP via ip-api.com's free tier
// (no API key, ~45 req/min) — the IP is sent to them over the wire for
// this one lookup and never stored by us anywhere; only the resulting
// city/country strings get written to analytics_events (see
// lib/analytics.ts). Mentioned as a data processor in the privacy policy.
//
// In-memory, per-process cache (cleared on restart/deploy, never
// persisted to disk or DB) so a single guest's session — guide_opened
// plus several section_viewed events, all from the same IP — doesn't
// trigger a repeat lookup for every event, which both respects
// ip-api.com's rate limit and minimizes how often the IP is sent out at
// all.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface GeoLocation {
  country: string | null;
  city: string | null;
}

const cache = new Map<string, { location: GeoLocation; expiresAt: number }>();

export async function lookupGeoLocation(ip: string): Promise<GeoLocation> {
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.location;
  }

  try {
    // http, not https — ip-api.com's free tier doesn't support TLS. This
    // request never touches the guest's browser (server-to-server only),
    // so there's no mixed-content concern.
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city`
    );

    if (!response.ok) return { country: null, city: null };

    const data = await response.json();
    const location: GeoLocation =
      data.status === "success"
        ? { country: data.country ?? null, city: data.city ?? null }
        : { country: null, city: null };

    cache.set(ip, { location, expiresAt: Date.now() + CACHE_TTL_MS });
    return location;
  } catch {
    return { country: null, city: null };
  }
}
