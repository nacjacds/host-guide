import { createClient } from "@/lib/supabase/server";
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
    .select("id, whatsapp_number")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return (
    <GuideLocaleProvider propertyId={property?.id ?? ""}>
      <GuideTransition>{children}</GuideTransition>
      {property && <WhatsAppFab whatsappNumber={property.whatsapp_number} />}
    </GuideLocaleProvider>
  );
}
