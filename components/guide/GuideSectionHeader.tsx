"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function GuideSectionHeader({
  slug,
  propertyName,
  accentColor,
  coverImageUrl,
}: {
  slug: string;
  propertyName: string;
  accentColor: string;
  coverImageUrl?: string | null;
}) {
  const { t } = useGuideLocale();

  return (
    <div
      className="sticky top-0 z-10 overflow-hidden shadow-md"
      style={coverImageUrl ? undefined : { backgroundColor: accentColor }}
    >
      {coverImageUrl && (
        <>
          <Image
            src={coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/75" />
        </>
      )}
      <div
        className="relative flex items-center gap-3 px-3 py-10 text-white sm:px-4 sm:py-12"
        style={{ textShadow: coverImageUrl ? "0 1px 2px rgba(0, 0, 0, 0.5)" : undefined }}
      >
        <Link
          href={`/guide/${slug}`}
          className="flex shrink-0 items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{t("back")}</span>
        </Link>
        <span className="truncate text-sm font-medium">{propertyName}</span>
        <div className="ml-auto hidden shrink-0 sm:block">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
