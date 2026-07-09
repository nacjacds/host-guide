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

// Shared shape for the host's monthly manual-regeneration quota status —
// used by the Settings page's global button and the Editor's per-section
// "Generar con IA" buttons alike (see lib/recommendations/quota.ts).
export interface RecommendationQuota {
  limit: number;
  used: number;
  remaining: number;
  resetDateLabel: string;
}

export const RECOMMENDATION_CATEGORY_LABELS: Record<PropertyRecommendationCategory, string> = {
  attractions: "Qué visitar",
  restaurants: "Dónde comer",
  nightlife: "Ocio nocturno",
  beaches: "Playas",
  nature: "Naturaleza",
};

export const RECOMMENDATION_CATEGORY_ICONS: Record<PropertyRecommendationCategory, LucideIcon> = {
  attractions: Landmark,
  restaurants: UtensilsCrossed,
  nightlife: Music,
  beaches: Palmtree,
  nature: Trees,
};
