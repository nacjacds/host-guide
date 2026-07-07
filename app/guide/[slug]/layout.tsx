import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GuideLocaleProvider } from "@/components/guide/GuideLocaleProvider";
import { GuideTransition } from "@/components/guide/GuideTransition";
import { WhatsAppFab } from "@/components/guide/WhatsAppFab";

export default async function GuideLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, host_id, whatsapp_number")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  let whatsappNumber = property?.whatsapp_number ?? null;

  // Fall back to the host's personal phone (profiles.phone) when the
  // property itself has no WhatsApp number configured, so a host only has
  // to fill it in once in /account to cover every property. profiles has no
  // public RLS select policy, so this needs the service-role client.
  if (property && !whatsappNumber) {
    const serviceClient = createServiceRoleClient();
    const { data: hostProfile } = await serviceClient
      .from("profiles")
      .select("phone")
      .eq("id", property.host_id)
      .single();
    whatsappNumber = hostProfile?.phone ?? null;
  }

  return (
    <GuideLocaleProvider propertyId={property?.id ?? ""}>
      <GuideTransition>{children}</GuideTransition>
      {property && <WhatsAppFab whatsappNumber={whatsappNumber} />}
    </GuideLocaleProvider>
  );
}
