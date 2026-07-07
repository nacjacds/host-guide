import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePlanDialog } from "@/components/account/ChangePlanDialog";
import { getPlan } from "@/lib/plans";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const plan = getPlan(profile?.plan);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Plan actual
            <Badge>
              {plan.label} — {plan.priceEurMonth}€/mes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePlanDialog currentPlan={plan.id} />
        </CardContent>
      </Card>

      <ProfileForm profile={profile} email={user!.email ?? ""} />
    </div>
  );
}
