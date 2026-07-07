import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/dashboard/PropertyCard";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("host_id", user!.id)
    .order("created_at", { ascending: false });

  const hasProperties = Boolean(properties?.length);

  return (
    <div className="space-y-6">
      {hasProperties && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Mis propiedades</h1>
          <Button nativeButton={false} render={<Link href="/properties/new" />}>
            Nueva propiedad
          </Button>
        </div>
      )}

      {hasProperties ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties!.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <OnboardingWizard />
      )}
    </div>
  );
}
