import { translateContent } from "./translateContent";
import { SOURCE_LOCALE, TARGET_LOCALES } from "./constants";
import type { PropertyRecommendationCategory } from "@/types";

// Fire-and-forget, same pattern as triggerBlockTranslation in trigger.ts —
// caches an entire category's AI-written descriptions together (one
// content_translations row per category, block_id null), so a guest
// viewing "Qué visitar" in English sees every place's description
// translated, not just the one that happened to change. Call this
// whenever any recommendation in a category is generated, regenerated, or
// hand-edited, passing the category's full current row set (not just the
// one that changed) — the translated blob covers all of them.
export function triggerRecommendationsTranslation(
  propertyId: string,
  category: PropertyRecommendationCategory,
  recommendations: {
    id: string;
    description: string | null;
    description_en_override?: string | null;
  }[]
): void {
  const descriptions: Record<string, string> = {};
  for (const rec of recommendations) {
    // A manually-overridden row already has its final English text — never
    // send it to Claude, so a regeneration of its siblings can't clobber it.
    if (rec.description_en_override?.trim()) continue;
    if (rec.description?.trim()) descriptions[rec.id] = rec.description;
  }
  if (Object.keys(descriptions).length === 0) return;

  for (const targetLocale of TARGET_LOCALES) {
    translateContent({
      propertyId,
      blockType: category,
      blockId: null,
      sourceLocale: SOURCE_LOCALE,
      targetLocale,
      content: { fields: { descriptions } },
    }).catch((err) => {
      console.error(
        "[translations] background recommendations translation failed",
        category,
        err
      );
    });
  }
}
