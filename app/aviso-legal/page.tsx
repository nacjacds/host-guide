import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/locale";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { AvisoLegalContent } from "@/components/legal/AvisoLegalContent";

export const metadata = {
  title: "Aviso Legal — WelcoKit",
};

export default async function AvisoLegalPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return (
    <LegalLayout initialLocale={localeCookie ? parseLocale(localeCookie) : undefined}>
      <AvisoLegalContent />
    </LegalLayout>
  );
}
