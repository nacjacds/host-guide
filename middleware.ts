import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE_NAME, detectLocaleFromAcceptLanguage } from "@/lib/locale";

const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export async function middleware(request: NextRequest) {
  // Locale detection: only when the visitor has no NEXT_LOCALE cookie yet
  // (first-ever visit, or cleared cookies) — an explicit prior choice
  // (cookie already set, from a previous visit or an ES/EN click) always
  // wins and this block is skipped entirely. Injected into
  // `request.cookies` (not just the response) so THIS SAME request's
  // server-rendered page (app/page.tsx) already reads the correct locale
  // on first paint — this is what eliminates the client-side
  // useEffect flash that existed before (SSR always rendering Spanish,
  // then flipping to English a moment after hydration).
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE_NAME);
  if (!hasLocaleCookie) {
    const detected = detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
    request.cookies.set(LOCALE_COOKIE_NAME, detected);
  }

  let response = NextResponse.next({ request });
  if (!hasLocaleCookie) {
    response.cookies.set(
      LOCALE_COOKIE_NAME,
      request.cookies.get(LOCALE_COOKIE_NAME)!.value,
      LOCALE_COOKIE_OPTIONS
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          // Supabase's setAll rebuilds `response` from scratch when it
          // fires (e.g. auth token refresh) — re-apply the locale cookie
          // so it isn't silently dropped in that case.
          if (!hasLocaleCookie) {
            response.cookies.set(
              LOCALE_COOKIE_NAME,
              request.cookies.get(LOCALE_COOKIE_NAME)!.value,
              LOCALE_COOKIE_OPTIONS
            );
          }
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
