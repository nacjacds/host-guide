"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

// Host-only shortcut back to the editor while previewing their own guide —
// only ever rendered server-side when the visitor's session matches the
// property's host_id (see app/guide/[slug]/layout.tsx), never for guests.
// Mirrors WhatsAppFab's fixed bottom bar, but anchored to the opposite
// corner (left instead of center/right) so the two never overlap.
export function BackToEditorFab() {
  const { t, propertyId } = useGuideLocale();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-start px-4 sm:px-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href={`/properties/${propertyId}/edit`}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1B4F72] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/25 transition-transform hover:scale-105"
      >
        <Pencil size={18} strokeWidth={1.5} />
        {t("backToEditor")}
      </Link>
    </div>
  );
}
