"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLandingLocale, type LandingLocale } from "./LandingLocaleProvider";

const LANGUAGES: { code: LandingLocale; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

export function LandingHeader() {
  const t = useTranslations("landing.nav");
  const { locale, setLocale } = useLandingLocale();

  return (
    <header className="sticky top-0 z-30 border-b border-[#DDD8CC]/70 bg-[#FAFAF8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="w-[130px] shrink-0 sm:w-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WelcoKit" className="h-auto w-full" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex rounded-full border border-[#DDD8CC] bg-white p-0.5 text-xs font-medium">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                aria-pressed={locale === lang.code}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  locale === lang.code
                    ? "bg-[#1B4F72] text-white"
                    : "text-[#6B6B67] hover:text-[#1A1A18]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hidden text-[#1B4F72] hover:bg-[#1B4F72]/5 hover:text-[#1B4F72] sm:inline-flex"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {t("login")}
          </Button>
          <Button
            size="sm"
            className="bg-[#FF4200] text-white hover:bg-[#e03a00]"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            {t("cta")}
          </Button>
        </div>
      </div>
    </header>
  );
}
