"use client";

import { useLocale } from "@/components/shared/LocaleProvider";
import type { AppLocale } from "@/lib/locale";
import { PoliticaPrivacidadEs } from "@/components/legal/content/PoliticaPrivacidadEs";
import { PoliticaPrivacidadEn } from "@/components/legal/content/PoliticaPrivacidadEn";
import { PoliticaPrivacidadFr } from "@/components/legal/content/PoliticaPrivacidadFr";
import { PoliticaPrivacidadIt } from "@/components/legal/content/PoliticaPrivacidadIt";
import { PoliticaPrivacidadPt } from "@/components/legal/content/PoliticaPrivacidadPt";

const CONTENT_BY_LOCALE: Record<AppLocale, () => React.ReactElement> = {
  es: PoliticaPrivacidadEs,
  en: PoliticaPrivacidadEn,
  fr: PoliticaPrivacidadFr,
  it: PoliticaPrivacidadIt,
  pt: PoliticaPrivacidadPt,
};

export function PoliticaPrivacidadContent() {
  const { locale } = useLocale();
  const Content = CONTENT_BY_LOCALE[locale];
  return <Content />;
}
