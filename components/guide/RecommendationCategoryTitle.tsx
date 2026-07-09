"use client";

import { useGuideLocale } from "./GuideLocaleProvider";
import type { GuideTranslationKey } from "@/lib/guide-i18n";
import type { PropertyRecommendationCategory } from "@/types";

export function RecommendationCategoryTitle({
  category,
}: {
  category: PropertyRecommendationCategory;
}) {
  const { t } = useGuideLocale();
  return <>{t(`block_${category}` as GuideTranslationKey)}</>;
}
