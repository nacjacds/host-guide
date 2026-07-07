import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";

const updateTicketSchema = z.object({
  status: z.enum(["open", "closed"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isSuperAdmin(user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const parsed = updateTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: ticket, error } = await serviceClient
    .from("support_tickets")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select()
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "No se pudo actualizar el ticket" }, { status: 400 });
  }

  return NextResponse.json({ ticket });
}
