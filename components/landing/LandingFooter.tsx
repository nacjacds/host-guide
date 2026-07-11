"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F5EFE6] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WelcoKit" className="mx-auto h-7 w-auto sm:mx-0" />
          <p className="max-w-xs text-xs text-[#6B6B67]">{t("tagline")}</p>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#1B4F72]">
          <Link href="/login" className="hover:underline">
            {t("login")}
          </Link>
          <Link href="/register" className="hover:underline">
            {t("register")}
          </Link>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-[#6B6B67]">
        {t("copyright", { year })}
      </p>
    </footer>
  );
}
