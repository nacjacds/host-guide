import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountHeader } from "@/components/account/AccountHeader";
import { CurrentPlanCard } from "@/components/account/CurrentPlanCard";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
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
      <AccountHeader currentPlan={plan.id} hasStripeCustomer={Boolean(profile?.stripe_customer_id)} />

      <CurrentPlanCard planId={plan.id} priceEurMonth={plan.priceEurMonth} />

      <ProfileForm profile={profile} email={user.email ?? ""} />

      <ChangePasswordForm email={user.email ?? ""} />

      <DeleteAccountButton />
    </div>
  );
}
