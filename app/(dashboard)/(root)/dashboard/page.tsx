import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PropertyCard } from "@/components/dashboard/PropertyCard";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { UpgradedToast } from "@/components/dashboard/UpgradedToast";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout above already redirects when there's no session, but it
  // re-fetches the user independently — an expired/invalid refresh token
  // can make that call return null here even when the layout's own check
  // passed moments earlier. Guard again rather than crash on user!.id.
  if (!user) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const hasProperties = Boolean(properties?.length);

  return (
    <>
      <UpgradedToast />
      <PageHeader
        title="Mis propiedades"
        action={
          hasProperties ? (
            <Button nativeButton={false} render={<Link href="/properties/new" />}>
              Añadir nueva
            </Button>
          ) : undefined
        }
      />

      {hasProperties ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties!.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <OnboardingWizard />
      )}
    </>
  );
}
