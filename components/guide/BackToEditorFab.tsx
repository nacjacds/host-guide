"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

// Host-only shortcut back to the editor while previewing their own guide —
// only ever rendered server-side when the visitor's session matches the
// property's host_id (see app/guide/[slug]/layout.tsx), never for guests.
// Pinned top-left, opposite corner from WhatsAppFab's fixed bottom bar, so
// the two never overlap. Rendered once in the root guide layout (wraps
// both the hero page and every section subpage), so it can't know
// per-page whether a GuideSectionHeader is present — top-20 clears that
// sticky header's own back-chevron/title row (which sits roughly
// y 40-104px, inside its py-10/12 bar) on section pages, while still
// reading as "near the top" on the plain hero page, which has nothing
// else in the top-left corner (logo is centered, language switcher is
// top-right).
export function BackToEditorFab() {
  const { t, propertyId } = useGuideLocale();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-start px-4 sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Link
        href={`/properties/${propertyId}/edit`}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1B4F72] px-3 py-3 text-sm font-medium text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 sm:px-5"
      >
        <Pencil size={18} strokeWidth={1.5} />
        <span className="hidden sm:inline">{t("backToEditor")}</span>
      </Link>
    </div>
  );
}
