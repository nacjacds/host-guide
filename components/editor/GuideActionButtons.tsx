"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShareGuideDialog } from "@/components/dashboard/ShareGuideDialog";
import { cn } from "@/lib/utils";
import { getAppUrl } from "@/lib/env";

// Single source of truth for the "Ver guía" / "Compartir guía" pair —
// rendered at two different DOM positions (desktop: inline in
// PublishPanel's sidebar; mobile: portaled above the property tabs, see
// PropertyEditor.tsx) rather than duplicated, so both stay in sync.
// ShareGuideDialog's own internal content (Fase 3, components/dashboard/)
// isn't translated yet — only the trigger label owned by this file is.
export function GuideActionButtons({
  propertyId,
  slug,
  isPublished,
  className,
}: {
  propertyId: string;
  slug: string;
  isPublished: boolean;
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
    </div>
  );
}
