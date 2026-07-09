"use client";

import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedBlock } from "./useTranslatedBlock";
import type { TranslatablePayload } from "@/lib/translations/extract";
import type { CheckinContent } from "@/components/editor/blocks/CheckinBlock";
import type { GuideBlock } from "@/types";

export function CheckinPanel({
  block,
  translated,
}: {
  block: GuideBlock;
  translated: TranslatablePayload | null;
}) {
  const { t } = useGuideLocale();
  const { content } = useTranslatedBlock({
    blockType: block.type,
    blockId: block.id,
    content: block.content,
    translated,
  });
  const checkinContent = content as unknown as CheckinContent;

  return (
    <div className="space-y-3">
      {checkinContent.time && (
        <p className="text-sm font-medium">
          {t("checkinFromLabel")} {checkinContent.time}
        </p>
      )}
      {checkinContent.instructions && (
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
          {checkinContent.instructions}
        </p>
      )}
    </div>
  );
}
