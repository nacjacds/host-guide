"use client";

import { ShieldCheck } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { FloatingReturnLink } from "./FloatingReturnLink";

// Shown only when a super admin opens a guide directly from /admin/properties'
// "Ver propiedad" link — NOT while impersonating a host (that case already
// swaps the session to the host's own, so BackToEditorFab covers it when
// the impersonated host is this property's owner) and NOT for the host
// themselves (see app/guide/[slug]/layout.tsx's isDirectAdminView, which
// is mutually exclusive with isOwner by construction).
export function AdminReturnFab({ returnTo }: { returnTo: string }) {
  const { t } = useGuideLocale();

  return <FloatingReturnLink href={returnTo} label={t("backToAdminPanel")} icon={ShieldCheck} />;
}
