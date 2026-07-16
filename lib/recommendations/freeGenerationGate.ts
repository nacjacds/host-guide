import { createServiceRoleClient } from "@/lib/supabase/server";
import { FREE_PLAN_AI_LOCKOUT_HOST_THRESHOLD } from "./constants";
import type { PropertyRecommendationCategory } from "@/types";

// Same definition of "host" the admin panel's own "Anfitriones" stat uses
// (app/admin/page.tsx: profiles.length) — every registered profile, not
// just the ones that went on to create a property. Kept consistent
// rather than inventing a second, narrower definition just for this gate.
export async function countTotalHosts(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function hasReachedFreeGenerationLockoutThreshold(): Promise<boolean> {
  const total = await countTotalHosts();
  return total >= FREE_PLAN_AI_LOCKOUT_HOST_THRESHOLD;
}

// Which of the given categories this email has already used its one free
// first-time generation for — keyed by email rather than host_id/property_id
// so it survives account deletion (see the migration's own comment for why).
export async function getEmailFreeGenerationUsage(
  email: string,
  categories: PropertyRecommendationCategory[]
): Promise<Set<string>> {
  if (categories.length === 0) return new Set();

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("free_ai_generation_usage")
    .select("category")
    .eq("email", email)
    .in("category", categories);

  return new Set((data ?? []).map((row) => row.category));
}

// Records that this email has now consumed its free first-time generation
// for each of these categories — idempotent (a second call for the same
// email+category is a no-op, matching the table's unique constraint)
// since a race between two near-simultaneous requests should never throw.
export async function recordFreeGenerationUsage(
  email: string,
  categories: PropertyRecommendationCategory[]
): Promise<void> {
  if (categories.length === 0) return;

  const supabase = createServiceRoleClient();
  await supabase
    .from("free_ai_generation_usage")
    .upsert(
      categories.map((category) => ({ email, category })),
      { onConflict: "email,category", ignoreDuplicates: true }
    );
}
