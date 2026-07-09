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
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

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
    [{ href: "/dashboard", label: "Propiedades" }],
    ...(isAdmin
      ? [[{ href: "/admin", label: "Admin", badge: openTicketCount > 0 ? openTicketCount : undefined }]]
      : []),
  ];

  return (
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
              className="mb-6 flex items-center gap-2 rounded-lg px-1 py-1 -mx-1 transition-colors hover:bg-sidebar-accent"
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
          </div>
          <SidebarNav navGroups={navGroups} />
        </aside>
        <main className="flex-1 p-4 md:p-6">
          {emailNotConfirmed && (
            <div className="mb-6 rounded-lg border border-accent bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
              Todavía no has confirmado tu email ({user.email}). Revisa tu bandeja de
              entrada y confirma tu cuenta para poder publicar tu guía.
            </div>
          )}
          {children}
        </main>
        <SupportWidget />
      </div>
    </div>
  );
}
