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
import { MobileTopbar, type NavLinkItem } from "@/components/dashboard/MobileTopbar";

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

  const navLinks: NavLinkItem[] = [
    { href: "/dashboard", label: "Propiedades" },
    { href: "/bookings", label: "Reservas" },
    { href: "/account", label: "Mi cuenta" },
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", badge: openTicketCount > 0 ? openTicketCount : undefined }]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {isImpersonating && (
        <ImpersonationBanner hostLabel={profile?.full_name ?? user.email ?? ""} />
      )}
      <MobileTopbar
        fullName={profile?.full_name ?? null}
        email={user.email ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
        navLinks={navLinks}
      />
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:block">
          <div className="mb-4 flex items-center gap-2 px-3 py-2">
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
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-sidebar-accent"
              >
                {link.label}
                {link.badge ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-white">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
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
