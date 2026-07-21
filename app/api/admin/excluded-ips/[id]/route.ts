import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { notAuthorizedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.from("analytics_excluded_ips").delete().eq("id", id);

  if (error) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo eliminar la IP", "Couldn't remove the IP") },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
