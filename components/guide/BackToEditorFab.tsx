"use client";

import { Pencil } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { FloatingReturnLink } from "./FloatingReturnLink";

// Host-only shortcut back to the editor while previewing their own guide —
// only ever rendered server-side when the visitor's session matches the
// property's host_id (see app/guide/[slug]/layout.tsx), never for guests.
// See AdminReturnFab for the sibling case (a super admin browsing a guide
// directly, not impersonating anyone) — the layout guarantees the two
// never render at the same time.
export function BackToEditorFab() {
  const { t, propertyId } = useGuideLocale();

  return (
    <FloatingReturnLink
      href={`/properties/${propertyId}/edit`}
      label={t("backToEditor")}
      icon={Pencil}
    />
  );
}
