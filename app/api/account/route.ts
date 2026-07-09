import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Deleting the auth user cascades to profiles, properties, guide_blocks
  // and every other row scoped to this host (all FKs are ON DELETE
  // CASCADE) — no per-table cleanup needed here. Storage objects (avatars,
  // cover images, block images) are not covered by that cascade and are
  // left orphaned; out of scope for this endpoint.
  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
