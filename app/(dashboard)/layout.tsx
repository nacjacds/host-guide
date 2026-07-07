import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/admin";
import { SupportWidget } from "@/components/support/SupportWidget";

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

  let openTicketCount = 0;
  if (isAdmin) {
    const serviceClient = createServiceRoleClient();
    const { count } = await serviceClient
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open");
    openTicketCount = count ?? 0;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
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
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-sidebar-accent">
            Propiedades
          </Link>
          <Link href="/account" className="rounded px-3 py-2 hover:bg-sidebar-accent">
            Mi cuenta
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-between rounded px-3 py-2 hover:bg-sidebar-accent"
            >
              Admin
              {openTicketCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-white">
                  {openTicketCount}
                </span>
              )}
            </Link>
          )}
        </nav>
      </aside>
      <main className="flex-1 p-6">
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
  );
}
