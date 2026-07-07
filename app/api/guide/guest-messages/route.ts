import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendGuestMessageNotification } from "@/lib/email";

const createGuestMessageSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().max(80).nullable().optional(),
  country: z.string().max(80).nullable().optional(),
  message: z.string().min(1).max(300),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: NextRequest) {
  const parsed = createGuestMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { property_id, name, country, message, rating } = parsed.data;
  const supabase = createServiceRoleClient();

  const { data: property } = await supabase
    .from("properties")
    .select("name, host_id, is_published")
    .eq("id", property_id)
    .single();

  if (!property || !property.is_published) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const { data: guestMessage, error } = await supabase
    .from("guest_messages")
    .insert({
      property_id,
      name: name || null,
      country: country || null,
      message,
      rating,
    })
    .select()
    .single();

  if (error || !guestMessage) {
    return NextResponse.json({ error: "No se pudo guardar el mensaje" }, { status: 400 });
  }

  try {
    const { data: hostUser } = await supabase.auth.admin.getUserById(property.host_id);
    if (hostUser?.user?.email) {
      await sendGuestMessageNotification({
        hostEmail: hostUser.user.email,
        propertyName: property.name,
        guestName: name || null,
        country: country || null,
        message,
        rating,
      });
    }
  } catch {
    // Notification is best-effort — never fail the guest's submission over it.
  }

  return NextResponse.json({ guestMessage }, { status: 201 });
}
