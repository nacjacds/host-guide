"use client";

import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { type AppLocale } from "@/lib/locale";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

// Legal pages are fixed Spanish content (Spanish legislation, not part of
// the i18n system yet) — only the shared header/footer chrome around them
// still follows the site's locale, same as every other page that reuses
// these components.
export function LegalLayout({
  initialLocale,
  children,
}: {
  initialLocale?: AppLocale;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <div className="min-h-screen bg-[#FAFAF8]">
        <LandingHeader />
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">{children}</main>
        <LandingFooter />
      </div>
    </LocaleProvider>
  );
}
