"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";

const LANGUAGES: { code: AppLocale; flag: string; label: string }[] = [
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "it", flag: "🇮🇹", label: "IT" },
  { code: "pt", flag: "🇵🇹", label: "PT" },
];

// Shared visual/behavioral definition of the language dropdown — used by
// the landing header and the dashboard sidebar/mobile menu alike, so both
// always look and behave identically rather than drifting apart as two
// separate hand-copied implementations. Replaces the old LocalePillSwitcher
// (a 2-segment ES|EN pill) now that there are 5 locales — a pill doesn't
// scale past 2-3 options, so this mirrors the same dropdown pattern already
// used by the guest guide's own switcher (components/guide/LanguageSwitcher.tsx),
// a separate locale system (AppLocale here, GuideLocale there).
export function LocaleSwitcher({
  locale,
  onChange,
  className,
}: {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
  className?: string;
}) {
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-[#DDD8CC] bg-white px-3 py-1 text-xs font-medium text-[#1A1A18] transition-colors hover:bg-[#1B4F72]/5",
          className
        )}
      >
        <span className="text-[16px] leading-none">{current.flag}</span>
        {current.label}
        <ChevronDown className="size-3.5" strokeWidth={2.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-24">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={cn(
              "justify-between gap-1.5",
              lang.code === locale && "bg-accent text-accent-foreground"
            )}
          >
            <span className="text-[16px] leading-none">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
