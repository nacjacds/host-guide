"use client";

import { Frown } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

// Shown instead of the guide content for a soft-deleted property, or for a
// personalized guest link (see lib/guestLinks.ts) whose stay period has
// ended — a dedicated, friendly message rather than the generic Next.js
// 404 that a genuinely-missing or not-yet-published guide falls back to
// (see lib/properties.ts's classifyGuideAvailability). Deliberately
// doesn't surface the property's own name/photo/accent color, unlike
// EmptyGuideState — nothing property-specific should still be shown to a
// visitor who shouldn't have access anymore.
export function GuideUnavailable({
  variant = "deleted",
}: {
  variant?: "deleted" | "link_expired";
}) {
  const { t } = useGuideLocale();
  const title = variant === "link_expired" ? t("linkExpiredTitle") : t("guideUnavailableTitle");
  const message = variant === "link_expired" ? t("linkExpiredMessage") : t("guideUnavailableMessage");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
      <Frown size={32} strokeWidth={1.5} className="text-[#6B6B67]" />
      <p className="font-serif text-xl font-bold text-[#1A1A18]">{title}</p>
      <p className="max-w-sm text-sm text-[#6B6B67]">{message}</p>
    </div>
  );
}
