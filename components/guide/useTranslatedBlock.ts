"use client";

import { useEffect, useRef, useState } from "react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { mergeTranslatedContent, type TranslatablePayload } from "@/lib/translations/extract";
import type { BlockType } from "@/types";

// Guest-facing content is pre-translated at save time (see
// lib/translations/trigger.ts) and read straight from content_translations
// server-side — `translated` below is that pre-fetched value, passed down
// as a prop, so the common case renders instantly with zero client fetch.
// This hook only reaches the network for the rare case where the cache is
// missing (e.g. content was saved seconds ago and the background job
// hasn't finished) — see app/api/guide/translate-block.
export function useTranslatedBlock({
  blockType,
  blockId,
  title,
  content,
  translated,
  skip = false,
}: {
  blockType: BlockType;
  blockId: string;
  title?: string | null;
  content: Record<string, unknown>;
  translated: TranslatablePayload | null;
  skip?: boolean;
}): { title: string | null; content: Record<string, unknown> } {
  const { locale, propertyId } = useGuideLocale();
  const [fallback, setFallback] = useState<TranslatablePayload | null>(null);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (skip || locale === "es" || translated || requestedFor.current === blockId) return;
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
  }, [skip, locale, translated, blockId]);

  if (skip || locale === "es") {
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
