import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/admin";
import { SupportWidget } from "@/components/support/SupportWidget";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { decodeImpersonationToken, IMPERSONATION_COOKIE_NAME } from "@/lib/impersonation";
import { MobileTopbar, type NavLinkGroup } from "@/components/dashboard/MobileTopbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { DashboardLocaleSwitcher } from "@/components/dashboard/DashboardLocaleSwitcher";
import { EmailNotConfirmedBanner } from "@/components/dashboard/EmailNotConfirmedBanner";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { parseLocale } from "@/lib/locale";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, dashboard_locale")
    .eq("id", user.id)
    .single();

  // Dashboard UI language — read from the profile (source of truth across
  // devices/browsers), completely independent from the guest-facing guide
  // locale (properties.language/content_translations). Only used to seed
  // LocaleProvider's initial render (avoids an ES-then-EN flash on first
  // paint) — every piece of translatable text below is resolved
  // client-side via useTranslations() so switching the pill re-renders
  // instantly instead of only after the next full page load.
  const locale = parseLocale(profile?.dashboard_locale);

  const emailNotConfirmed = !user.email_confirmed_at;
  const isAdmin = isSuperAdmin(user.email);

  const cookieStore = await cookies();
  const impersonationToken = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;
  const isImpersonating = impersonationToken
    ? decodeImpersonationToken(impersonationToken) !== null
    : false;

  let openTicketCount = 0;
  if (isAdmin) {
    const serviceClient = createServiceRoleClient();
    const { count } = await serviceClient
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open");
    openTicketCount = count ?? 0;
  }

  const navGroups: NavLinkGroup[] = [
    [{ href: "/dashboard", labelKey: "properties" }],
    ...(isAdmin
      ? [
          [
            {
              href: "/admin",
              labelKey: "admin",
              badge: openTicketCount > 0 ? openTicketCount : undefined,
            },
          ],
        ]
      : []),
  ];

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="flex min-h-screen flex-col">
        {isImpersonating && (
          <ImpersonationBanner hostLabel={profile?.full_name ?? user.email ?? ""} />
        )}
        <MobileTopbar
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          navGroups={navGroups}
        />
        <div className="flex flex-1">
          <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:block">
            <div className="space-y-2 px-3 py-2">
              <Link href="/dashboard" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="WelcoKit"
                  style={{ width: "200px", height: "auto" }}
                  className="mx-auto max-w-full"
                />
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-1 py-1 -mx-1 transition-colors hover:bg-sidebar-accent"
              >
                <Avatar className="size-8">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
                  )}
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium">
                  {profile?.full_name ?? user.email}
                </span>
              </Link>
              <DashboardLocaleSwitcher className="mb-6" />
            </div>
            <SidebarNav navGroups={navGroups} />
          </aside>
          <main className="flex-1 p-4 md:p-6">
            {emailNotConfirmed && <EmailNotConfirmedBanner email={user.email ?? ""} />}
            {children}
          </main>
          <SupportWidget />
        </div>
      </div>
    </LocaleProvider>
  );
}
