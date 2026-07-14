import { cookies } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { GuideLocaleProvider } from "@/components/guide/GuideLocaleProvider";
import { resolvePropertySourceLocale } from "@/lib/translations/constants";
import { GuideTransition } from "@/components/guide/GuideTransition";
import { WhatsAppFab } from "@/components/guide/WhatsAppFab";
import { BackToEditorFab } from "@/components/guide/BackToEditorFab";
import { AdminReturnFab } from "@/components/guide/AdminReturnFab";
import { GuideFooter } from "@/components/guide/GuideFooter";
import { isSuperAdmin } from "@/lib/admin";
import { decodeImpersonationToken, IMPERSONATION_COOKIE_NAME } from "@/lib/impersonation";

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
    .select("id, host_id, whatsapp_number, is_published, deleted_at, language")
    .eq("slug", slug)
    .single();

  const isAvailable = Boolean(property && property.is_published && !property.deleted_at);
  let whatsappNumber = property?.whatsapp_number ?? null;

  // Shows the "Back to editor" shortcut only when the visitor's own
  // session matches this exact property's host_id — never for guests
  // (no session), and never for a host logged in but viewing someone
  // else's guide. Independent of isAvailable/publish state on purpose: a
  // host previewing their own draft should get the shortcut too.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = Boolean(user && property && user.id === property.host_id);

  // A super admin browsing a guide directly from /admin/properties' "Ver
  // propiedad" link (not the host, and not currently impersonating anyone)
  // gets "Volver a admin" instead of "Back to editor". Impersonation
  // itself swaps the session to the host's own (see lib/impersonation.ts),
  // so isOwner above already covers "admin impersonating this exact
  // property's host" correctly; the impersonation-cookie check here is
  // defense-in-depth — in practice a session can never be both the real
  // super admin's and mid-impersonation at once, since
  // /api/admin/impersonate blocks impersonating your own account. Mutually
  // exclusive with isOwner by construction, so the two FABs never render
  // together.
  const cookieStore = await cookies();
  const isImpersonating = Boolean(
    decodeImpersonationToken(cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value ?? "")
  );
  const isDirectAdminView = !isOwner && !isImpersonating && isSuperAdmin(user?.email);

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
    <GuideLocaleProvider
      propertyId={property?.id ?? ""}
      sourceLocale={resolvePropertySourceLocale(property?.language)}
    >
      <GuideTransition>{children}</GuideTransition>
      <GuideFooter />
      {isAvailable && <WhatsAppFab whatsappNumber={whatsappNumber} />}
      {isOwner && <BackToEditorFab />}
      {isDirectAdminView && <AdminReturnFab returnTo="/admin/properties" />}
    </GuideLocaleProvider>
  );
}
