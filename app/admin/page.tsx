import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { AdminOverviewContent } from "@/components/admin/AdminOverviewContent";
import type { AdminHostRow } from "@/components/admin/AdminHostsTable";
import type { AdminTicketRow } from "@/components/admin/AdminTicketsSection";
import type { PlanId } from "@/lib/plans";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    redirect("/login");
  }

  const serviceClient = createServiceRoleClient();

  const [{ data: profiles }, { data: usersList }, { data: properties }, { data: tickets }] =
    await Promise.all([
      serviceClient
        .from("profiles")
        .select("id, plan, created_at")
        .order("created_at", { ascending: false }),
      serviceClient.auth.admin.listUsers({ perPage: 1000 }),
      serviceClient.from("properties").select("id, host_id, is_published"),
      serviceClient
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

  const emailById = new Map(usersList?.users.map((u) => [u.id, u.email ?? "—"]) ?? []);
  const propertiesByHost = new Map<string, { total: number; published: number }>();

  for (const property of properties ?? []) {
    const entry = propertiesByHost.get(property.host_id) ?? { total: 0, published: 0 };
    entry.total += 1;
    if (property.is_published) entry.published += 1;
    propertiesByHost.set(property.host_id, entry);
  }

  const hosts: AdminHostRow[] = (profiles ?? []).map((profile) => ({
    id: profile.id,
    email: emailById.get(profile.id) ?? "—",
    plan: profile.plan as PlanId,
    propertyCount: propertiesByHost.get(profile.id)?.total ?? 0,
    createdAt: profile.created_at,
  }));

  const totalHosts = hosts.length;
  const totalProperties = properties?.length ?? 0;
  const totalPublished = properties?.filter((p) => p.is_published).length ?? 0;
  const totalDraft = totalProperties - totalPublished;

  const ticketRows: AdminTicketRow[] = (tickets ?? []).map((ticket) => ({
    id: ticket.id,
    email: emailById.get(ticket.user_id) ?? "—",
    type: ticket.type,
    subject: ticket.subject,
    description: ticket.description,
    screenshotUrl: ticket.screenshot_url,
    status: ticket.status,
    createdAt: ticket.created_at,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt="WelcoKit"
        style={{ width: "200px", height: "auto" }}
        className="mx-auto mb-4"
      />
      <AdminOverviewContent
        totalHosts={totalHosts}
        totalProperties={totalProperties}
        totalPublished={totalPublished}
        totalDraft={totalDraft}
        hosts={hosts}
        ticketRows={ticketRows}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
