// Pure, no server-only imports — safe to import from client components
// (e.g. TileGrid) as well as server components.

// A plain object, not a Map — this crosses the server/client component
// boundary as a prop, and Map isn't guaranteed to survive that
// serialization the way a plain JSON-shaped object is.
export type PropertyTranslations = Record<string, unknown>;

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
