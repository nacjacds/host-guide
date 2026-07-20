"use client";

import { useLocale } from "@/components/shared/LocaleProvider";
import type { AppLocale } from "@/lib/locale";
import { AvisoLegalEs } from "@/components/legal/content/AvisoLegalEs";
import { AvisoLegalEn } from "@/components/legal/content/AvisoLegalEn";
import { AvisoLegalFr } from "@/components/legal/content/AvisoLegalFr";
import { AvisoLegalIt } from "@/components/legal/content/AvisoLegalIt";
import { AvisoLegalPt } from "@/components/legal/content/AvisoLegalPt";

const CONTENT_BY_LOCALE: Record<AppLocale, () => React.ReactElement> = {
  es: AvisoLegalEs,
  en: AvisoLegalEn,
  fr: AvisoLegalFr,
  it: AvisoLegalIt,
  pt: AvisoLegalPt,
};

export function AvisoLegalContent() {
  const { locale } = useLocale();
  const Content = CONTENT_BY_LOCALE[locale];
  return <Content />;
}
