"use client";

import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedText } from "./useTranslatedText";
import type { CheckinContent } from "@/components/editor/blocks/CheckinBlock";
import type { GuideBlock } from "@/types";

export function CheckinPanel({ block }: { block: GuideBlock }) {
  const { t } = useGuideLocale();
  const content = block.content as unknown as CheckinContent;
  const instructions = useTranslatedText(content.instructions ?? "");

  return (
    <div className="space-y-3">
      {content.time && (
        <p className="text-sm font-medium">
          {t("checkinFromLabel")} {content.time}
        </p>
      )}
      {instructions && (
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{instructions}</p>
      )}
    </div>
  );
}
