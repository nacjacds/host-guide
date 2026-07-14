import { createServiceRoleClient } from "@/lib/supabase/server";
import { planAllowsRecommendationRegeneration } from "@/lib/plans";
import type { CategoryRegenerationStatus } from "./constants";
import type { PropertyRecommendationCategory } from "@/types";

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfNextMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

// Per-property, per-category monthly regeneration status — replaces the
// old host-wide shared pool. A category's first-ever generation (no rows
// in property_recommendations yet for this property+category) is always
// free and uncounted, for every plan including Free. Once a category has
// content, regenerating it again requires a paid plan and is capped at
// once per calendar month, independently of every other category and
// every other property — two properties owned by the same host never
// share a counter. Super admins bypass the gate entirely: always
// available, and (see the regenerate route) never recorded as usage.
export async function getRecommendationRegenerationStatus(
  propertyId: string,
  categories: PropertyRecommendationCategory[],
  { planId, isSuperAdmin }: { planId: string | null | undefined; isSuperAdmin: boolean }
): Promise<Record<string, CategoryRegenerationStatus>> {
  const result: Record<string, CategoryRegenerationStatus> = {};

  if (isSuperAdmin) {
    for (const category of categories) {
      result[category] = {
        available: true,
        isFirstGeneration: false,
        blockedReason: null,
        nextAvailableAt: null,
      };
    }
    return result;
  }

  if (categories.length === 0) return result;

  const supabase = createServiceRoleClient();

  const { data: existingRows } = await supabase
    .from("property_recommendations")
    .select("category")
    .eq("property_id", propertyId)
    .in("category", categories);
  const categoriesWithContent = new Set((existingRows ?? []).map((r) => r.category));

  const { data: usageRows } = await supabase
    .from("recommendation_regeneration_usage")
    .select("category")
    .eq("property_id", propertyId)
    .eq("trigger_type", "manual")
    .in("category", categories)
    .gte("triggered_at", startOfCurrentMonth().toISOString());
  const categoriesUsedThisMonth = new Set((usageRows ?? []).map((r) => r.category));

  const regenerationEnabled = planAllowsRecommendationRegeneration(planId);

  for (const category of categories) {
    if (!categoriesWithContent.has(category)) {
      result[category] = {
        available: true,
        isFirstGeneration: true,
        blockedReason: null,
        nextAvailableAt: null,
      };
      continue;
    }

    if (!regenerationEnabled) {
      result[category] = {
        available: false,
        isFirstGeneration: false,
        blockedReason: "plan",
        nextAvailableAt: null,
      };
      continue;
    }

    if (categoriesUsedThisMonth.has(category)) {
      result[category] = {
        available: false,
        isFirstGeneration: false,
        blockedReason: "used_this_month",
        nextAvailableAt: startOfNextMonth().toISOString(),
      };
      continue;
    }

    result[category] = {
      available: true,
      isFirstGeneration: false,
      blockedReason: null,
      nextAvailableAt: null,
    };
  }

  return result;
}
