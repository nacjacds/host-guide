"use client";

import { useEffect, useRef, useState } from "react";
import { useGuideLocale } from "./GuideLocaleProvider";
import type { TranslatablePayload } from "@/lib/translations/extract";

// Mirrors useTranslatedBlock.ts's pattern for a whole recommendation
// category: `translated` is pre-fetched server-side (the common case,
// zero client fetch) — this only reaches the network when that cache is
// missing (e.g. a place was just added/edited and the background
// translation job hasn't finished yet).
export function useTranslatedRecommendations({
  category,
  recommendations,
  translated,
}: {
  category: string;
  recommendations: { id: string; description: string | null }[];
  translated: TranslatablePayload | null;
}): Record<string, string> {
  const { locale, propertyId } = useGuideLocale();
  const [fallback, setFallback] = useState<TranslatablePayload | null>(null);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (locale === "es" || translated || requestedFor.current === category) return;

    const descriptions: Record<string, string> = {};
    for (const rec of recommendations) {
      if (rec.description?.trim()) descriptions[rec.id] = rec.description;
    }
    if (Object.keys(descriptions).length === 0) return;

    requestedFor.current = category;

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
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, translated, category]);

  if (locale === "es") return {};

  const effective = translated ?? fallback;
  const descriptions = effective?.fields?.descriptions;
  return descriptions && typeof descriptions === "object"
    ? (descriptions as Record<string, string>)
    : {};
}
