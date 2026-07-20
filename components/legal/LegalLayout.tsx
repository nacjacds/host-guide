"use client";

import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { type AppLocale } from "@/lib/locale";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

// Legal content is under Spanish jurisdiction regardless of the reader's
// language (see each XContent.tsx dispatcher's own locale-to-component map),
// so it's translated but not run through next-intl/messages — the header and
// footer chrome around it already follows the site's locale via this same
// LocaleProvider, same as every other page that reuses these components.
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
