import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { AdminExcludedIpsPageContent } from "@/components/admin/AdminExcludedIpsPageContent";

export default async function AdminAnalyticsIpsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    redirect("/login");
  }

  const serviceClient = createServiceRoleClient();
  const { data: excludedIps } = await serviceClient
    .from("analytics_excluded_ips")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <AdminExcludedIpsPageContent initialExcludedIps={excludedIps ?? []} />
    </div>
  );
}
