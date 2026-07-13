"use client";

import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";

const LANGUAGES: { code: AppLocale; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

// Shared visual/behavioral definition of the ES/EN pill toggle — used by
// the landing header and the dashboard sidebar/mobile menu alike, so both
// always look and behave identically rather than drifting apart as two
// separate hand-copied implementations.
export function LocalePillSwitcher({
  locale,
  onChange,
  className,
}: {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-full border border-[#DDD8CC] bg-white p-0.5 text-xs font-medium",
        className
      )}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
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
  );
}
