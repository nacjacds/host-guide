import { translateContent } from "./translateContent";
import { RECOMMENDATIONS_SOURCE_LOCALE, RECOMMENDATIONS_TARGET_LOCALES } from "./constants";
import type { PropertyRecommendationCategory } from "@/types";

// Fire-and-forget, same pattern as triggerBlockTranslation in trigger.ts —
// caches an entire category's AI-written descriptions together (one
// content_translations row per category PER TARGET LOCALE, block_id
// null), so a guest viewing "Qué visitar" in any non-Spanish locale sees
// every place's description translated, not just the one that happened to
// change. Call this whenever any recommendation in a category is
// generated, regenerated, or hand-edited, passing the category's full
// current row set (not just the one that changed) — each translated blob
// covers all of them.
export function triggerRecommendationsTranslation(
  propertyId: string,
  category: PropertyRecommendationCategory,
  recommendations: {
    id: string;
    description: string | null;
    description_overrides?: Record<string, string> | null;
  }[]
): void {
  for (const targetLocale of RECOMMENDATIONS_TARGET_LOCALES) {
    const descriptions: Record<string, string> = {};
    for (const rec of recommendations) {
      // A manually-overridden row already has its final text for THIS
      // locale — never send it to Claude, so a regeneration of its
      // siblings can't clobber it. A row with only e.g. an "en" override
      // still gets auto-translated into fr/it/pt normally.
      if (rec.description_overrides?.[targetLocale]?.trim()) continue;
      if (rec.description?.trim()) descriptions[rec.id] = rec.description;
    }
    if (Object.keys(descriptions).length === 0) continue;

    translateContent({
      propertyId,
      blockType: category,
      blockId: null,
      sourceLocale: RECOMMENDATIONS_SOURCE_LOCALE,
      targetLocale,
      content: { fields: { descriptions } },
    }).catch((err) => {
      console.error(
        "[translations] background recommendations translation failed",
        category,
        targetLocale,
        err
      );
    });
  }
}
