"use client";

import { Sparkles } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

export function EmptyGuideState({ accentColor }: { accentColor: string }) {
  const { t } = useGuideLocale();

  return (
    <div className="mx-4 my-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center sm:mx-6 lg:mx-8">
      <Sparkles size={32} strokeWidth={1.5} color={accentColor} />
      <p className="font-serif text-xl font-bold">{t("emptyGuideTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("emptyGuideMessage")}</p>
    </div>
  );
}
