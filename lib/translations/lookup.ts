// Pure, no server-only imports — safe to import from client components
// (e.g. TileGrid) as well as server components.

import type { GuideLocale } from "@/lib/guide-i18n";

// A plain object, not a Map — this crosses the server/client component
// boundary as a prop, and Map isn't guaranteed to survive that
// serialization the way a plain JSON-shaped object is.
export type PropertyTranslations = Record<string, unknown>;

// Server components prefetch every non-source locale up front (see
// fetchPropertyTranslationsForLocales) since they can't know which one a
// given guest has picked — that choice only exists client-side
// (GuideLocaleProvider, backed by localStorage). Leaf components/hooks
// then index into this by the CURRENT locale from useGuideLocale() to
// resolve the one they actually need. Partial because a locale with zero
// content_translations rows for this property simply won't have a key.
export type PropertyTranslationsByLocale = Partial<Record<GuideLocale, PropertyTranslations>>;

export function translationKey(blockType: string, blockId: string | null): string {
  return `${blockType}:${blockId ?? "null"}`;
}

export function lookupTranslation<T>(
  translations: PropertyTranslations,
  blockType: string,
  blockId: string | null
): T | null {
  return (translations[translationKey(blockType, blockId)] as T | undefined) ?? null;
}
