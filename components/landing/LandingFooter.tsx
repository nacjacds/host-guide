"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const loginHref = `/login?returnTo=${encodeURIComponent(pathname)}`;
  const registerHref = `/register?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <footer className="bg-[#F5EFE6] py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="space-y-2">
            <p className="max-w-xs font-script text-2xl font-bold text-[#1A4F72] italic">
              {t("tagline")}
            </p>
          </div>

          <div className="flex items-center gap-5 text-sm text-[#1B4F72]">
            <Link href={loginHref} className="hover:underline">
              {t("login")}
            </Link>
            <Link href={registerHref} className="hover:underline">
              {t("register")}
            </Link>
          </div>
        </div>

        {/*
          Fixed Spanish labels, not run through next-intl — these link to
          legal pages that are themselves fixed-Spanish content (Spanish
          legislation), not part of the i18n system yet.
        */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#DDD8CC] pt-6 text-xs text-[#6B6B67] sm:justify-start">
          <Link href="/aviso-legal" className="hover:underline">
            Aviso Legal
          </Link>
          <Link href="/politica-de-privacidad" className="hover:underline">
            Política de Privacidad
          </Link>
          <Link href="/politica-de-cookies" className="hover:underline">
            Política de Cookies
          </Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-[#6B6B67]">{t("copyright", { year })}</p>
    </footer>
  );
}
