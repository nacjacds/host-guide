import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/locale";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { PoliticaPrivacidadContent } from "@/components/legal/PoliticaPrivacidadContent";

export const metadata = {
  title: "Política de Privacidad — WelcoKit",
};

export default async function PoliticaPrivacidadPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return (
    <LegalLayout initialLocale={localeCookie ? parseLocale(localeCookie) : undefined}>
      <PoliticaPrivacidadContent />
    </LegalLayout>
  );
}
