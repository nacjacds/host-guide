import { GuideLocaleProvider } from "@/components/guide/GuideLocaleProvider";
import { resolvePropertySourceLocale } from "@/lib/translations/constants";
import { GuideTransition } from "@/components/guide/GuideTransition";
import { WhatsAppFab } from "@/components/guide/WhatsAppFab";
import { GuideFooter } from "@/components/guide/GuideFooter";
import { resolveGuestLink } from "@/lib/guestLinks";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Mirrors app/guide/[slug]/layout.tsx, but resolves the property through a
// personalized guest-link token (see lib/guestLinks.ts) instead of a slug —
// no BackToEditorFab/AdminReturnFab here, since a dated guest link is never
// how a host previews their own guide.
export default async function GuestLinkLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolution = await resolveGuestLink(token);
  const isAvailable = resolution.status === "available";

  let whatsappNumber = resolution.property?.whatsapp_number ?? null;
  if (isAvailable && !whatsappNumber && resolution.property) {
    const serviceClient = createServiceRoleClient();
    const { data: hostProfile } = await serviceClient
      .from("profiles")
      .select("phone")
      .eq("id", resolution.property.host_id)
      .single();
    whatsappNumber = hostProfile?.phone ?? null;
  }

  return (
    <GuideLocaleProvider
      propertyId={resolution.property?.id ?? ""}
      sourceLocale={resolvePropertySourceLocale(resolution.property?.language)}
      stayDates={
        isAvailable && resolution.checkinDate && resolution.checkoutDate
          ? { checkin: resolution.checkinDate, checkout: resolution.checkoutDate }
          : null
      }
    >
      <GuideTransition>{children}</GuideTransition>
      <GuideFooter />
      {isAvailable && <WhatsAppFab whatsappNumber={whatsappNumber} />}
    </GuideLocaleProvider>
  );
}
