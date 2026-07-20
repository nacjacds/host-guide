"use client";

import { useLocale } from "@/components/shared/LocaleProvider";
import type { AppLocale } from "@/lib/locale";
import { PoliticaCookiesEs } from "@/components/legal/content/PoliticaCookiesEs";
import { PoliticaCookiesEn } from "@/components/legal/content/PoliticaCookiesEn";
import { PoliticaCookiesFr } from "@/components/legal/content/PoliticaCookiesFr";
import { PoliticaCookiesIt } from "@/components/legal/content/PoliticaCookiesIt";
import { PoliticaCookiesPt } from "@/components/legal/content/PoliticaCookiesPt";

const CONTENT_BY_LOCALE: Record<AppLocale, () => React.ReactElement> = {
  es: PoliticaCookiesEs,
  en: PoliticaCookiesEn,
  fr: PoliticaCookiesFr,
  it: PoliticaCookiesIt,
  pt: PoliticaCookiesPt,
};

export function PoliticaCookiesContent() {
  const { locale } = useLocale();
  const Content = CONTENT_BY_LOCALE[locale];
  return <Content />;
}
