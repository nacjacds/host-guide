"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Shared position/style for the two "go back to where I came from" pills
// that can float over a guide (BackToEditorFab for the host previewing
// their own guide, AdminReturnFab for a super admin browsing a guide
// directly) — kept in one place so the two stay visually identical.
// Pinned top-left, opposite corner from WhatsAppFab's fixed bottom bar, so
// neither ever overlaps it. Rendered inside the root guide layout (wraps
// both the hero page and every section subpage), so it can't know
// per-page whether a GuideSectionHeader is present — top-20 clears that
// sticky header's own back-chevron/title row (which sits roughly
// y 40-104px, inside its py-10/12 bar) on section pages, while still
// reading as "near the top" on the plain hero page, which has nothing
// else in the top-left corner (logo is centered, language switcher is
// top-right).
export function FloatingReturnLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-start px-4 sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Link
        href={href}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1B4F72] px-3 py-3 text-sm font-medium text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 sm:px-5"
      >
        <Icon size={18} strokeWidth={1.5} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </div>
  );
}
