"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

export function BackToGuideButton({ slug }: { slug: string }) {
  const { t } = useGuideLocale();

  return (
    <Link
      href={`/guide/${slug}`}
      className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      {t("back")}
    </Link>
  );
}
