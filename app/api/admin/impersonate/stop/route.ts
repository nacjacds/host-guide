import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { decodeImpersonationToken, IMPERSONATION_COOKIE_NAME } from "@/lib/impersonation";

export async function POST() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;

  if (!raw) {
    return NextResponse.json(
      { error: "No hay una sesión de impersonación activa" },
      { status: 400 }
    );
  }

  const payload = decodeImpersonationToken(raw);
  if (!payload) {
    cookieStore.delete(IMPERSONATION_COOKIE_NAME);
    return NextResponse.json(
      { error: "El acceso de administrador caducó, inicia sesión de nuevo" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.refreshSession({
    refresh_token: payload.refreshToken,
  });

  cookieStore.delete(IMPERSONATION_COOKIE_NAME);

  if (error) {
    return NextResponse.json(
      { error: "No se pudo restaurar la sesión de administrador, inicia sesión de nuevo" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
