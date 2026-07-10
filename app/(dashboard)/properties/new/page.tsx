import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plans";
import { PropertyLimitNotice } from "@/components/dashboard/PropertyLimitNotice";
import { NewPropertyForm } from "@/components/dashboard/NewPropertyForm";

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout above already redirects when there's no session, but it
  // re-fetches the user independently — an expired/invalid refresh token
  // can make that call return null here even when the layout's own check
  // passed moments earlier. Guard again rather than crash on user!.id.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile?.plan);

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("host_id", user.id);

  const propertyCount = count ?? 0;

  if (propertyCount >= plan.maxProperties) {
    return <PropertyLimitNotice plan={plan} count={propertyCount} />;
  }

  return <NewPropertyForm />;
}
