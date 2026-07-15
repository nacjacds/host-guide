"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const loginHref = `/login?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <footer className="bg-[#F5EFE6] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="space-y-2">
          <p className="max-w-xs font-script text-2xl font-bold text-[#1A4F72] italic">
            {t("tagline")}
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#1B4F72]">
          <Link href={loginHref} className="hover:underline">
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
