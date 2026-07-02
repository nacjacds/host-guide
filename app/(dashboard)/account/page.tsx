import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLAN_LABELS = { free: "Free", basic: "Basic (9€/mes)", pro: "Pro (24€/mes)" };

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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Plan actual
            <Badge>{PLAN_LABELS[profile?.plan ?? "free"]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Cambiar de plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{profile?.full_name}</p>
          <p className="text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
