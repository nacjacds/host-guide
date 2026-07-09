"use client";

import { getBlockTitle } from "@/lib/guide-i18n";
import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedBlock } from "./useTranslatedBlock";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { GuideBlock } from "@/types";

export function BlockTitle({
  block,
  translated,
}: {
  block: Pick<GuideBlock, "id" | "type" | "title" | "content">;
  translated: TranslatablePayload | null;
}) {
  const { t } = useGuideLocale();
  // Only "custom" block titles are AI-translated — every other type's title
  // shown to guests comes from the static i18n dict (getBlockTitle below),
  // regardless of what the host typed in guide_blocks.title.
  const { title } = useTranslatedBlock({
    blockType: block.type,
    blockId: block.id,
    title: block.title,
    content: block.content,
    translated,
    skip: block.type !== "custom",
  });

  if (block.type === "custom") {
    return <>{title ?? ""}</>;
  }

  return <>{getBlockTitle(block, t)}</>;
}
