"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";
import type { GuideLocale } from "@/lib/guide-i18n";

const LANGUAGES: { code: GuideLocale; flag: string; label: string }[] = [
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "en", flag: "🇬🇧", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useGuideLocale();
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25"
      >
        {current.flag} {current.label}
        <ChevronDown className="size-3" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-24">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={cn(
              "justify-between",
              lang.code === locale && "bg-accent text-accent-foreground"
            )}
          >
            {lang.flag} {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
