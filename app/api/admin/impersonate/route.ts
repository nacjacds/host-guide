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

const bodySchema = z.object({ userId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(admin?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
  }
  const { userId } = parsed.data;

  if (userId === admin!.id) {
    return NextResponse.json(
      { error: "No puedes impersonar tu propia cuenta" },
      { status: 400 }
    );
  }

  const {
    data: { session: adminSession },
  } = await supabase.auth.getSession();
  if (!adminSession?.refresh_token) {
    return NextResponse.json({ error: "No se pudo leer la sesión actual" }, { status: 500 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: targetUserData, error: targetUserError } =
    await serviceClient.auth.admin.getUserById(userId);
  if (targetUserError || !targetUserData.user?.email) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (isSuperAdmin(targetUserData.user.email)) {
    return NextResponse.json(
      { error: "No se puede impersonar a otro administrador" },
      { status: 400 }
    );
  }

  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: "magiclink",
    email: targetUserData.user.email,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.json({ error: "No se pudo generar el acceso" }, { status: 500 });
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });
  if (verifyError) {
    return NextResponse.json({ error: "No se pudo iniciar la impersonación" }, { status: 500 });
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
