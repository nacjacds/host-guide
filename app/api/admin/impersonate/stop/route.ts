import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { decodeImpersonationToken, IMPERSONATION_COOKIE_NAME } from "@/lib/impersonation";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

// This route is only ever called from the ImpersonationBanner's "Volver a
// admin" button, so its errors should read in the admin's own locale —
// same reasoning as the banner itself (see (dashboard)/layout.tsx): the
// active session at this point is the impersonated HOST's, not the
// admin's, so we resolve locale from the decoded cookie's adminId instead
// of the current session whenever we have one available.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;
  const supabase = await createClient();

  if (!raw) {
    const locale = await getApiLocale(request, supabase, null);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "No hay una sesión de impersonación activa",
          "There's no active impersonation session"
        ),
      },
      { status: 400 }
    );
  }

  const payload = decodeImpersonationToken(raw);
  if (!payload) {
    cookieStore.delete(IMPERSONATION_COOKIE_NAME);
    const locale = await getApiLocale(request, supabase, null);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "El acceso de administrador caducó, inicia sesión de nuevo",
          "The admin access expired, log in again"
        ),
      },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.refreshSession({
    refresh_token: payload.refreshToken,
  });

  cookieStore.delete(IMPERSONATION_COOKIE_NAME);

  if (error) {
    // Service-role client, not the request-scoped one: the session at this
    // point is (or was) the impersonated host's, which has no RLS
    // permission to read the admin's own profile row.
    const locale = await getApiLocale(request, createServiceRoleClient(), payload.adminId);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "No se pudo restaurar la sesión de administrador, inicia sesión de nuevo",
          "Couldn't restore the admin session, log in again"
        ),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
