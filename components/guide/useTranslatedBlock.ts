"use client";

import { useEffect, useRef, useState } from "react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { mergeTranslatedContent, type TranslatablePayload } from "@/lib/translations/extract";
import { lookupTranslation, type PropertyTranslationsByLocale } from "@/lib/translations/lookup";
import type { BlockType } from "@/types";

// Guest-facing content is pre-translated at save time (see
// lib/translations/trigger.ts) and read straight from content_translations
// server-side — `translationsByLocale` below is that pre-fetched map, for
// EVERY non-source locale (see fetchPropertyTranslationsForLocales),
// passed down as a prop so the common case renders instantly with zero
// client fetch regardless of which locale the guest ends up on. This hook
// only reaches the network for the rare case where the cache is missing
// for the CURRENT locale (e.g. content was saved seconds ago and the
// background job hasn't finished) — see app/api/guide/translate-block.
export function useTranslatedBlock({
  blockType,
  blockId,
  title,
  content,
  translationsByLocale,
  skip = false,
}: {
  blockType: BlockType;
  blockId: string;
  title?: string | null;
  content: Record<string, unknown>;
  translationsByLocale: PropertyTranslationsByLocale;
  skip?: boolean;
}): { title: string | null; content: Record<string, unknown> } {
  const { locale, propertyId, sourceLocale } = useGuideLocale();
  const translated = lookupTranslation<TranslatablePayload>(
    translationsByLocale[locale] ?? {},
    blockType,
    blockId
  );
  const [fallback, setFallback] = useState<TranslatablePayload | null>(null);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (skip || locale === sourceLocale || translated || requestedFor.current === blockId) return;
    requestedFor.current = blockId;

    let cancelled = false;
    fetch("/api/guide/translate-block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, targetLocale: locale, blockType, blockId, title, content }),
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
  }, [skip, locale, sourceLocale, translated, blockId]);

  if (skip || locale === sourceLocale) {
    return { title: title ?? null, content };
  }

  const effective = translated ?? fallback;
  if (!effective) {
    return { title: title ?? null, content };
  }

  return {
    title: effective.title ?? title ?? null,
    content: mergeTranslatedContent(blockType, content, effective.fields),
  };
}
