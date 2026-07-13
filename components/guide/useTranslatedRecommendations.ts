"use client";

import { useEffect, useRef, useState } from "react";
import { useGuideLocale } from "./GuideLocaleProvider";
import type { TranslatablePayload } from "@/lib/translations/extract";

// Mirrors useTranslatedBlock.ts's pattern for a whole recommendation
// category: `translated` is pre-fetched server-side (the common case,
// zero client fetch) — this only reaches the network when that cache is
// missing (e.g. a place was just added/edited and the background
// translation job hasn't finished yet). `isLoading` covers that fallback
// window (a real Claude call, ~3s) so callers can show a skeleton instead
// of flashing the original-language text next to already-translated UI
// chrome.
export function useTranslatedRecommendations({
  category,
  recommendations,
  translated,
}: {
  category: string;
  recommendations: { id: string; description: string | null; description_en_override?: string | null }[];
  translated: TranslatablePayload | null;
}): { descriptions: Record<string, string>; isLoading: boolean } {
  const { locale, propertyId } = useGuideLocale();
  const [fallback, setFallback] = useState<TranslatablePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (locale === "es" || translated || requestedFor.current === category) return;

    const descriptions: Record<string, string> = {};
    for (const rec of recommendations) {
      // A manually-overridden row already has its final English text —
      // no need to ask Claude to translate it too.
      if (rec.description_en_override?.trim()) continue;
      if (rec.description?.trim()) descriptions[rec.id] = rec.description;
    }
    if (Object.keys(descriptions).length === 0) return;

    requestedFor.current = category;
    setIsLoading(true);

    let cancelled = false;
    fetch("/api/guide/translate-block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        targetLocale: locale,
        blockType: category,
        blockId: null,
        content: { fields: { descriptions } },
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { translated: TranslatablePayload | null } | null) => {
        if (!cancelled && data?.translated) setFallback(data.translated);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, translated, category]);

  if (locale === "es") return { descriptions: {}, isLoading: false };

  const effective = translated ?? fallback;
  const cached = effective?.fields?.descriptions;
  const descriptions: Record<string, string> =
    cached && typeof cached === "object" ? { ...(cached as Record<string, string>) } : {};

  // A manual override always wins over whatever's cached — it can never be
  // silently replaced by a later regeneration of sibling recommendations.
  for (const rec of recommendations) {
    if (rec.description_en_override?.trim()) descriptions[rec.id] = rec.description_en_override;
  }

  return { descriptions, isLoading };
}
