import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePlanDialog } from "@/components/account/ChangePlanDialog";
import { LogoutButton } from "@/components/account/LogoutButton";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";
import { getPlan } from "@/lib/plans";

export default async function AccountPage() {
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
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile?.plan);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Mi cuenta"
        action={
          <ChangePlanDialog
            currentPlan={plan.id}
            hasStripeCustomer={Boolean(profile?.stripe_customer_id)}
          />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-normal">
            Plan actual:
            <span className="inline-flex items-center rounded-full border border-[#DDD8CC] bg-[#F5EFE6] px-3 py-1 text-sm font-medium text-[#1B4F72]">
              {plan.label} — {plan.priceEurMonth}€/mes
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <ProfileForm profile={profile} email={user.email ?? ""} />

      <LogoutButton />

      <DeleteAccountButton />
    </div>
  );
}
