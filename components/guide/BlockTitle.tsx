"use client";

import { getBlockTitle } from "@/lib/guide-i18n";
import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedText } from "./useTranslatedText";
import type { GuideBlock } from "@/types";

export function BlockTitle({ block }: { block: Pick<GuideBlock, "type" | "title"> }) {
  const { t } = useGuideLocale();
  const original = block.title ?? "";
  const translated = useTranslatedText(original, block.type === "custom");

  if (block.type === "custom") {
    return <>{translated}</>;
  }

  return <>{getBlockTitle(block, t)}</>;
}
