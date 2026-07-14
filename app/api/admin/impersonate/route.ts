import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import {
  encodeImpersonationToken,
  IMPERSONATION_COOKIE_NAME,
  IMPERSONATION_MAX_AGE_SECONDS,
} from "@/lib/impersonation";
import { notAuthorizedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const bodySchema = z.object({ userId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(admin?.email)) {
    return notAuthorizedResponse(request, supabase, admin?.id ?? null);
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json({ error: pick(locale, "Usuario inválido", "Invalid user") }, { status: 400 });
  }
  const { userId } = parsed.data;

  if (userId === admin!.id) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json(
      { error: pick(locale, "No puedes impersonar tu propia cuenta", "You can't impersonate your own account") },
      { status: 400 }
    );
  }

  const {
    data: { session: adminSession },
  } = await supabase.auth.getSession();
  if (!adminSession?.refresh_token) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo leer la sesión actual", "Couldn't read the current session") },
      { status: 500 }
    );
  }

  const serviceClient = createServiceRoleClient();
  const { data: targetUserData, error: targetUserError } =
    await serviceClient.auth.admin.getUserById(userId);
  if (targetUserError || !targetUserData.user?.email) {
    return notFoundResponse(request, supabase, admin!.id, "user");
  }

  if (isSuperAdmin(targetUserData.user.email)) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "No se puede impersonar a otro administrador",
          "You can't impersonate another administrator"
        ),
      },
      { status: 400 }
    );
  }

  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: "magiclink",
    email: targetUserData.user.email,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo generar el acceso", "Couldn't generate access") },
      { status: 500 }
    );
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });
  if (verifyError) {
    const locale = await getApiLocale(request, supabase, admin!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo iniciar la impersonación", "Couldn't start impersonation") },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    IMPERSONATION_COOKIE_NAME,
    encodeImpersonationToken({
      adminId: admin!.id,
      refreshToken: adminSession.refresh_token,
      issuedAt: Date.now(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: IMPERSONATION_MAX_AGE_SECONDS,
    }
  );

  return NextResponse.json({ ok: true });
}
