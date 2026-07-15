import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/locale";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const { returnTo } = await searchParams;

  return (
    <RegisterForm
      initialLocale={localeCookie ? parseLocale(localeCookie) : undefined}
      returnTo={returnTo}
    />
  );
}
