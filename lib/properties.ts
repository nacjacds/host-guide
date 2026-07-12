// How long a soft-deleted property stays recoverable before it becomes a
// candidate for the super admin's manual permanent-purge action (see
// app/admin/properties/page.tsx). Single source of truth — nothing else
// should hardcode "30 days" for this.
export const DELETED_PROPERTY_RETENTION_DAYS = 30;

export function isPurgeEligible(deletedAt: string | null): boolean {
  if (!deletedAt) return false;
  const cutoff = Date.now() - DELETED_PROPERTY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return new Date(deletedAt).getTime() <= cutoff;
}

export type GuideAvailability = "not_found" | "deleted" | "unpublished" | "available";

// Classifies what a guest visiting a guide URL should see, for a property
// row fetched WITHOUT the usual `is_published = true` filter (so deleted
// and merely-unpublished properties can be told apart and given different
// messaging, instead of both collapsing into the same generic 404).
export function classifyGuideAvailability(
  property: { is_published: boolean; deleted_at: string | null } | null
): GuideAvailability {
  if (!property) return "not_found";
  if (property.deleted_at) return "deleted";
  if (!property.is_published) return "unpublished";
  return "available";
}
