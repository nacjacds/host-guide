import { Landmark, UtensilsCrossed, Music, Palmtree, Trees, type LucideIcon } from "lucide-react";
import type { PropertyRecommendationCategory } from "@/types";

// Regenerate automatically only every 60-90 days — Google Places + Claude
// calls cost money per property, and local recommendations don't change
// often enough to warrant more frequent regeneration. The manual
// "Regenerar recomendaciones" button in Settings bypasses this.
export const REGENERATION_INTERVAL_DAYS = 90;

// Categories always searched for every property.
export const BASE_RECOMMENDATION_CATEGORIES: PropertyRecommendationCategory[] = [
  "attractions",
  "restaurants",
  "nightlife",
];

// Categories only kept if Google Places actually finds results nearby.
export const OPTIONAL_RECOMMENDATION_CATEGORIES: PropertyRecommendationCategory[] = [
  "beaches",
  "nature",
];

export const MAX_PLACES_PER_CATEGORY = 10;

// Once the total number of registered hosts (profiles rows — same
// definition the admin panel's own "Anfitriones" stat already uses, see
// app/admin/page.tsx) reaches this count, the Free plan's one-time-per-
// category free generation (see lib/recommendations/quota.ts) is retired
// entirely: Free then behaves exactly like a paid plan with no
// regeneration access, with no first-generation exemption at all. A
// single named constant rather than scattering the number 500 across
// call sites, so raising/lowering it later is a one-line change.
export const FREE_PLAN_AI_LOCKOUT_HOST_THRESHOLD = 500;

// Per-category, per-property manual-regeneration status (see
// lib/recommendations/quota.ts) — one of these per category, not a single
// global count. nextAvailableAt is an ISO string, formatted client-side
// (lib/recommendations/format.ts) so it reacts instantly to a dashboard
// locale switch instead of being baked into Spanish/English at
// server-render time.
export interface CategoryRegenerationStatus {
  available: boolean;
  // True when this category has never had any recommendations generated
  // for this property before AND this host's plan still grants the free
  // first-generation exemption (see quota.ts) — false for every other
  // case, including a first-ever generation that's blocked outright.
  isFirstGeneration: boolean;
  // Only set when available is false:
  // - "plan": the category already has content and the host's plan has
  //   no regeneration access at all (Free).
  // - "used_this_month": this exact category already consumed its one
  //   regeneration this calendar month (any plan with regeneration access).
  // - "free_generation_used": this would otherwise be a free first
  //   generation, but this host's email already consumed its one free
  //   generation for this category before (possibly on a different,
  //   since-deleted property/account — see free_ai_generation_usage).
  // - "plan_locked_out": Free's free-first-generation exemption has been
  //   retired entirely because FREE_PLAN_AI_LOCKOUT_HOST_THRESHOLD has
  //   been reached — this would have been a free first generation before
  //   that threshold, but no longer is.
  blockedReason: "plan" | "used_this_month" | "free_generation_used" | "plan_locked_out" | null;
  // ISO string, only set when blockedReason === "used_this_month".
  nextAvailableAt: string | null;
}

export const RECOMMENDATION_CATEGORY_ICONS: Record<PropertyRecommendationCategory, LucideIcon> = {
  attractions: Landmark,
  restaurants: UtensilsCrossed,
  nightlife: Music,
  beaches: Palmtree,
  nature: Trees,
};
