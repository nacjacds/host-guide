export type PlanId = "free" | "starter" | "pro" | "agency";

export interface PlanDefinition {
  id: PlanId;
  label: string;
  priceEurMonth: number;
  maxProperties: number;
  aiEnabled: boolean;
  analyticsEnabled: boolean;
  whiteLabel: boolean;
  // Monthly cap on manual "Regenerar recomendaciones" clicks, shared across
  // every property the host owns (not per-property) — protects against
  // uncontrolled Google Places + Claude spend. Scheduled/cron regenerations
  // and any future initial-generation-on-creation are exempt.
  monthlyRecommendationRegenerations: number;
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
    monthlyRecommendationRegenerations: 1,
  },
  starter: {
    id: "starter",
    label: "Starter",
    priceEurMonth: 5,
    maxProperties: 3,
    aiEnabled: true,
    analyticsEnabled: false,
    whiteLabel: false,
    monthlyRecommendationRegenerations: 3,
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceEurMonth: 12,
    maxProperties: 10,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: false,
    monthlyRecommendationRegenerations: 10,
  },
  agency: {
    id: "agency",
    label: "Agency",
    priceEurMonth: 29,
    maxProperties: 30,
    aiEnabled: true,
    analyticsEnabled: true,
    whiteLabel: true,
    monthlyRecommendationRegenerations: 25,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "agency"];

export function getPlan(planId: string | null | undefined): PlanDefinition {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

export function planPropertyLimit(planId: string | null | undefined): number {
  return getPlan(planId).maxProperties;
}

export function planRecommendationRegenerationLimit(planId: string | null | undefined): number {
  return getPlan(planId).monthlyRecommendationRegenerations;
}

// The next plan tier with a higher manual-regeneration quota than the
// current one, if any — powers the "Mejorar plan" link shown when a host
// hits their monthly limit.
export function nextPlanWithMoreRegenerations(planId: string | null | undefined): PlanDefinition | null {
  const current = getPlan(planId);
  const currentIndex = PLAN_ORDER.indexOf(current.id);
  for (const id of PLAN_ORDER.slice(currentIndex + 1)) {
    if (PLANS[id].monthlyRecommendationRegenerations > current.monthlyRecommendationRegenerations) {
      return PLANS[id];
    }
  }
  return null;
}
