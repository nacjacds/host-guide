"use client";

import { cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useGuideLocale();

  return (
    <div className="inline-flex gap-0.5 rounded-full border border-white/20 bg-white/15 p-0.5 text-xs backdrop-blur-md">
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={cn(
          "rounded-full px-3 py-1 font-medium transition-colors",
          locale === "es"
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-white/75 hover:text-white"
        )}
      >
        🇪🇸 ES
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-full px-3 py-1 font-medium transition-colors",
          locale === "en"
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-white/75 hover:text-white"
        )}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
