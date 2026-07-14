import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { AdminPropertiesPageContent } from "@/components/admin/AdminPropertiesPageContent";
import type { AdminPropertyRow } from "@/components/admin/AdminPropertiesTable";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    redirect("/login");
  }

  const serviceClient = createServiceRoleClient();

  const [{ data: properties }, { data: profiles }, { data: usersList }] = await Promise.all([
    serviceClient
      .from("properties")
      .select("id, name, slug, host_id, is_published, deleted_at, deleted_by_host_plan, created_at")
      .order("deleted_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    serviceClient.from("profiles").select("id, plan"),
    serviceClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailById = new Map(usersList?.users.map((u) => [u.id, u.email ?? "—"]) ?? []);
  const planById = new Map((profiles ?? []).map((p) => [p.id, p.plan]));

  const rows: AdminPropertyRow[] = (properties ?? []).map((property) => ({
    id: property.id,
    name: property.name,
    slug: property.slug,
    hostEmail: emailById.get(property.host_id) ?? "—",
    hostCurrentPlan: planById.get(property.host_id) ?? null,
    isPublished: property.is_published,
    deletedAt: property.deleted_at,
    deletedByHostPlan: property.deleted_by_host_plan,
    createdAt: property.created_at,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <AdminPropertiesPageContent rows={rows} />
    </div>
  );
}
