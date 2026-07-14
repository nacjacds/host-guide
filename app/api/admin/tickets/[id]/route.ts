import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { notAuthorizedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

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
    return notAuthorizedResponse(request, supabase, user?.id ?? null);
  }

  const parsed = updateTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json({ error: pick(locale, "Estado inválido", "Invalid status") }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: ticket, error } = await serviceClient
    .from("support_tickets")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select()
    .single();

  if (error || !ticket) {
    const locale = await getApiLocale(request, supabase, user!.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo actualizar el ticket", "Couldn't update the ticket") },
      { status: 400 }
    );
  }

  return NextResponse.json({ ticket });
}
