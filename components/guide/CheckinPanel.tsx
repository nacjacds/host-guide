"use client";

import { useGuideLocale } from "./GuideLocaleProvider";
import { useTranslatedBlock } from "./useTranslatedBlock";
import { formatLocalizedDate } from "@/lib/formatDate";
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
  const { t, locale, stayDates } = useGuideLocale();
  const { content } = useTranslatedBlock({
    blockType: block.type,
    blockId: block.id,
    content: block.content,
    translated,
  });
  const checkinContent = content as unknown as CheckinContent;
  const isCheckout = block.type === "checkout";
  // Only set when this guide was opened through a personalized guest link
  // (see lib/guestLinks.ts) — the generic slug-based guide has no stay of
  // its own, so this stays null there and only the time-of-day shows.
  const stayDate = stayDates && (isCheckout ? stayDates.checkout : stayDates.checkin);

  return (
    <div className="space-y-3">
      {stayDate && (
        <p className="text-sm font-medium">
          {t(isCheckout ? "block_checkout" : "block_checkin")}:{" "}
          {formatLocalizedDate(stayDate, locale)}
        </p>
      )}
      {checkinContent.time && (
        <p className="text-sm font-medium">
          {t(isCheckout ? "checkoutFromLabel" : "checkinFromLabel")} {checkinContent.time}
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
