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

// Per-category, per-property manual-regeneration status (see
// lib/recommendations/quota.ts) — one of these per category, not a single
// global count. nextAvailableAt is an ISO string, formatted client-side
// (lib/recommendations/format.ts) so it reacts instantly to a dashboard
// locale switch instead of being baked into Spanish/English at
// server-render time.
export interface CategoryRegenerationStatus {
  available: boolean;
  // True when this category has never had any recommendations generated
  // for this property before — that first generation is always free and
  // uncounted, regardless of plan (see quota.ts).
  isFirstGeneration: boolean;
  // Only set when available is false: "plan" means the host's plan has no
  // regeneration access at all (Free); "used_this_month" means this exact
  // category already consumed its one regeneration this calendar month.
  blockedReason: "plan" | "used_this_month" | null;
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
