// Shared validation for a host-supplied Google Maps link override
// (property_recommendations.maps_url) — lets a host correct the
// auto-generated Google Places link when it's wrong. Deliberately lenient:
// Google has several valid URL shapes for the same place
// (maps.google.com/..., maps.app.goo.gl/..., goo.gl/maps/..., g.co/kgs/...,
// or a plain google.com/maps/place/... link copied from a browser address
// bar) — this only confirms it's a well-formed http(s) URL, not that it
// specifically points at a Google domain.
export function isValidMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
