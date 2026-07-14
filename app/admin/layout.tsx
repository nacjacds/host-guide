import { createClient } from "@/lib/supabase/server";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { parseLocale } from "@/lib/locale";

// Outside the (dashboard) route group, so it doesn't inherit that
// layout's LocaleProvider — each page still does its own isSuperAdmin
// redirect, this only seeds the dashboard locale for whichever admin is
// actually looking at it (never reached during impersonation: the
// impersonated session's isSuperAdmin check fails and redirects to
// /login before this layout's children ever render meaningful content).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let locale;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("dashboard_locale")
      .eq("id", user.id)
      .single();
    locale = parseLocale(profile?.dashboard_locale);
  }

  return <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>;
}
