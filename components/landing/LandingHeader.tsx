"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/shared/LocaleProvider";
import { LocalePillSwitcher } from "@/components/shared/LocalePillSwitcher";

export function LandingHeader() {
  const t = useTranslations("landing.nav");
  const { locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-30 border-b border-[#DDD8CC]/70 bg-[#FAFAF8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="w-[130px] shrink-0 sm:w-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WelcoKit" className="h-auto w-full" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocalePillSwitcher locale={locale} onChange={setLocale} />

          <Button
            variant="ghost"
            size="sm"
            className="text-[#1B4F72] hover:bg-[#1B4F72]/5 hover:text-[#1B4F72]"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {t("login")}
          </Button>
        </div>
      </div>
    </header>
  );
}
