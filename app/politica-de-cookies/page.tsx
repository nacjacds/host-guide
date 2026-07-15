import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/locale";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { PoliticaCookiesContent } from "@/components/legal/PoliticaCookiesContent";

export const metadata = {
  title: "Política de Cookies — WelcoKit",
};

export default async function PoliticaCookiesPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return (
    <LegalLayout initialLocale={localeCookie ? parseLocale(localeCookie) : undefined}>
      <PoliticaCookiesContent />
    </LegalLayout>
  );
}
