"use client";

import { useTranslations } from "next-intl";

export function EmailNotConfirmedBanner({ email }: { email: string }) {
  const t = useTranslations("dashboard.layout");

  return (
    <div className="mb-6 rounded-lg border border-accent bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
      {t("emailNotConfirmed", { email })}
    </div>
  );
}
