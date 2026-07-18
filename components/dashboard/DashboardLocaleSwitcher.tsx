"use client";

import { useLocale } from "@/components/shared/LocaleProvider";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import type { AppLocale } from "@/lib/locale";

// Same dropdown as the landing header, but also persists the choice to
// profiles.dashboard_locale so it follows the host to any device/browser
// they log into — independent of the guest-facing guide locale
// (content_translations/properties.language), which this never touches.
export function DashboardLocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  function handleChange(next: AppLocale) {
    // Instant: updates the UI and the NEXT_LOCALE cookie synchronously.
    setLocale(next);
    // Fire-and-forget: the switch must never wait on this. A failed save
    // just means the next login re-syncs from the last value that did
    // save (see LoginForm.tsx), not a broken UI right now.
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dashboard_locale: next }),
    }).catch(() => {});
  }

  return <LocaleSwitcher locale={locale} onChange={handleChange} className={className} />;
}
