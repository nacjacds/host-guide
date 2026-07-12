import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GuideLocaleProvider } from "@/components/guide/GuideLocaleProvider";
import { GuideTransition } from "@/components/guide/GuideTransition";
import { WhatsAppFab } from "@/components/guide/WhatsAppFab";
import { GuideFooter } from "@/components/guide/GuideFooter";

export default async function GuideLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // No is_published/deleted_at filter here — unlike the page routes, this
  // layout needs to tell "draft" and "deleted" apart itself (both must
  // hide the WhatsApp FAB, but a deleted property must never show it even
  // if it's still otherwise flagged published — see
  // lib/properties.ts's classifyGuideAvailability, used the same way by
  // every page route nested under this layout).
  const { data: property } = await supabase
    .from("properties")
    .select("id, host_id, whatsapp_number, is_published, deleted_at")
    .eq("slug", slug)
    .single();

  const isAvailable = Boolean(property && property.is_published && !property.deleted_at);
  let whatsappNumber = property?.whatsapp_number ?? null;

  // Fall back to the host's personal phone (profiles.phone) when the
  // property itself has no WhatsApp number configured, so a host only has
  // to fill it in once in /account to cover every property. profiles has no
  // public RLS select policy, so this needs the service-role client.
  if (isAvailable && !whatsappNumber && property) {
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
      <GuideFooter />
      {isAvailable && <WhatsAppFab whatsappNumber={whatsappNumber} />}
    </GuideLocaleProvider>
  );
}
