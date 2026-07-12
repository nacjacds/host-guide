import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: property, error } = await serviceClient
    .from("properties")
    .update({ deleted_at: null, deleted_by_host_plan: null })
    .eq("id", id)
    .select("id, name")
    .single();

  if (error || !property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ property });
}
