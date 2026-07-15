import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/locale";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const { returnTo } = await searchParams;

  return (
    <LoginForm
      initialLocale={localeCookie ? parseLocale(localeCookie) : undefined}
      returnTo={returnTo}
    />
  );
}
