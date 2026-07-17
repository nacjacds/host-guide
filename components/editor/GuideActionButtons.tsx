"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShareGuideDialog } from "@/components/dashboard/ShareGuideDialog";
import { GuestLinksDialog } from "./GuestLinksDialog";
import { cn } from "@/lib/utils";
import { getAppUrl } from "@/lib/env";
import type { GuestGuideLink } from "@/types";

// Single source of truth for the "Ver guía" / "Compartir guía" /
// "Generar enlace" trio — rendered at two different DOM positions
// (desktop: inline in PublishPanel's sidebar; mobile: portaled above the
// property tabs, see PropertyEditor.tsx) rather than duplicated, so all
// three stay in sync. guestLinks is lifted to PropertyEditor for the same
// reason isPublished is — see its own comment there for the bug this
// avoids repeating. ShareGuideDialog's own internal content (Fase 3,
// components/dashboard/) isn't translated yet — only the trigger label
// owned by this file is.
export function GuideActionButtons({
  propertyId,
  slug,
  isPublished,
  guestLinks,
  onGuestLinksChange,
  className,
}: {
  propertyId: string;
  slug: string;
  isPublished: boolean;
  guestLinks: GuestGuideLink[];
  onGuestLinksChange: (links: GuestGuideLink[]) => void;
  className?: string;
}) {
  const t = useTranslations("dashboard.editor.guideActions");
  const guideUrl = `${getAppUrl()}/guide/${slug}`;

  return (
    <div className={cn("flex gap-2", className)}>
      {isPublished && (
        <Button
          variant="outline"
          className="flex-1"
          render={<a href={guideUrl} target="_blank" rel="noopener noreferrer" />}
          nativeButton={false}
        >
          {t("viewGuide")}
        </Button>
      )}
      <ShareGuideDialog
        propertyId={propertyId}
        guideUrl={guideUrl}
        triggerLabel={t("shareGuide")}
        triggerVariant="secondary"
        triggerClassName="flex-1"
      />
      <GuestLinksDialog
        propertyId={propertyId}
        guestLinks={guestLinks}
        onGuestLinksChange={onGuestLinksChange}
      />
    </div>
  );
}
