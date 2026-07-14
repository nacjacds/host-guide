import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { notAuthorizedResponse, notFoundResponse } from "@/lib/apiResponses";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const serviceClient = createServiceRoleClient();
  const { data: property, error } = await serviceClient
    .from("properties")
    .update({ deleted_at: null, deleted_by_host_plan: null })
    .eq("id", id)
    .select("id, name")
    .single();

  if (error || !property) {
    return notFoundResponse(request, supabase, user!.id, "property");
  }

  return NextResponse.json({ property });
}
