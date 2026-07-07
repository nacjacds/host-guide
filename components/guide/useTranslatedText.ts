"use client";

import { useEffect, useState } from "react";
import { useGuideLocale } from "./GuideLocaleProvider";

const translationCache = new Map<string, string>();

export function useTranslatedText(text: string, enabled = true): string {
  const { locale, propertyId } = useGuideLocale();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!enabled || locale !== "en" || !text) return;

    const cacheKey = `en:${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;
    fetch("/api/guide/translate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, propertyId }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { translated: string }) => {
        if (cancelled) return;
        translationCache.set(cacheKey, data.translated);
        setTranslated(data.translated);
      })
      .catch(() => {
        // Translation failed — keep showing the original text.
      });

    return () => {
      cancelled = true;
    };
  }, [text, locale, enabled, propertyId]);

  return locale === "en" ? translated : text;
}
