"use client";

import { useTranslations } from "next-intl";

export function OnboardingProgressBar({ step }: { step: 1 | 2 | 3 }) {
  const t = useTranslations("dashboard.onboarding.progressBar");
  const percent = (step / 3) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("step", { step })}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
