import type { NextRequest } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import { parseLocale, LOCALE_COOKIE_NAME, type AppLocale } from "@/lib/locale";

// Centralized locale resolution for API route error messages (previously
// always hardcoded Spanish regardless of the requesting host's dashboard
// language). Mirrors the two-tier lookup used by the rest of the i18n
// work: profiles.dashboard_locale is authoritative when we know who's
// asking (it's the one source of truth that follows a host across
// devices — see CLAUDE.md), falling back to the NEXT_LOCALE cookie
// (kept in sync on every locale-pill switch, see LocaleProvider) for
// routes with no session yet (login, register, forgot-password,
// webhooks) or when the profile lookup comes back empty.
//
// Never touches the DB when userId is null (e.g. the "not authenticated"
// path itself, by far the most common error) — the cookie fallback
// covers that case directly.
export async function getApiLocale(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | null
): Promise<AppLocale> {
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("dashboard_locale")
      .eq("id", userId)
      .single();
    if (profile) return parseLocale(profile.dashboard_locale);
  }
  return parseLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
}
