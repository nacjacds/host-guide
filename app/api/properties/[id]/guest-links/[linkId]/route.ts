import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { id: propertyId, linkId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  // RLS (guest_guide_links_delete_own) is the real gate here too — this
  // property-ownership check just gets us a clean 404 instead of a bare
  // RLS-denied no-op when the property itself isn't the caller's.
  const { error } = await supabase
    .from("guest_guide_links")
    .delete()
    .eq("id", linkId)
    .eq("property_id", propertyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
