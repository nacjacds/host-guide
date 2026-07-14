export type PlanId = "free" | "starter" | "pro" | "agency";

export interface PlanDefinition {
  id: PlanId;
  label: string;
  priceEurMonth: number;
  maxProperties: number;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  whiteLabel: boolean;
  // Whether this plan can manually regenerate AI recommendations at all.
  // When true, each category (Qué visitar, Dónde comer, ...) can be
  // regenerated at most once per calendar month, per property — see
  // lib/recommendations/quota.ts. A category's very first generation
  // (no existing content yet) is exempt from this and always allowed,
  // regardless of plan. Every paid tier gets the same cadence — there is
  // no higher-tier multiplier, unlike the old shared monthly pool.
  recommendationRegenerationsEnabled: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    label: "Free",
    priceEurMonth: 0,
    maxProperties: 1,
    aiEnabled: false,
    analyticsEnabled: false,
    whiteLabel: false,
    recommendationRegenerationsEnabled: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    priceEurMonth: 5,
    maxProperties: 3,
    aiEnabled: true,
    analyticsEnabled: false,
    whiteLabel: false,
    recommendationRegenerationsEnabled: true,
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceEurMonth: 12,
    maxProperties: 10,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: false,
    recommendationRegenerationsEnabled: true,
  },
  agency: {
    id: "agency",
    label: "Agency",
    priceEurMonth: 29,
    maxProperties: 30,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: true,
    recommendationRegenerationsEnabled: true,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "agency"];

export function getPlan(planId: string | null | undefined): PlanDefinition {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

export function planPropertyLimit(planId: string | null | undefined): number {
  return getPlan(planId).maxProperties;
}

export function planAllowsRecommendationRegeneration(planId: string | null | undefined): boolean {
  return getPlan(planId).recommendationRegenerationsEnabled;
}

// The cheapest plan that unlocks manual recommendation regeneration —
// powers the "Mejorar plan" link shown when a Free host hits the gate.
// Every paid tier grants the same per-category cadence, so this is only
// ever meaningful coming from Free; returns null for any plan that
// already has access.
export function cheapestPlanWithRecommendationRegenerations(
  planId: string | null | undefined
): PlanDefinition | null {
  if (getPlan(planId).recommendationRegenerationsEnabled) return null;
  return PLANS.starter;
}
