import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendBookingWelcomeEmail } from "@/lib/email";
import { generateGuideQrCodeBuffer, getGuideUrl } from "@/lib/qr";

const createBookingSchema = z
  .object({
    property_id: z.string().uuid(),
    guest_name: z.string().min(1).max(120),
    guest_email: z.string().email().max(255).optional().or(z.literal("")),
    guest_phone: z.string().max(50).optional().or(z.literal("")),
    checkin_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkout_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    auto_email_enabled: z.boolean().optional(),
  })
  .refine((data) => data.checkout_date > data.checkin_date, {
    message: "La fecha de salida debe ser posterior a la de entrada",
    path: ["checkout_date"],
  });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = createBookingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de reserva inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, slug, cover_image_url, host_id")
    .eq("id", data.property_id)
    .eq("host_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const autoEmailEnabled = data.auto_email_enabled ?? true;
  const guestEmail = data.guest_email || null;

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      property_id: property.id,
      host_id: user.id,
      guest_name: data.guest_name,
      guest_email: guestEmail,
      guest_phone: data.guest_phone || null,
      checkin_date: data.checkin_date,
      checkout_date: data.checkout_date,
      auto_email_enabled: autoEmailEnabled,
    })
    .select()
    .single();

  if (insertError || !booking) {
    return NextResponse.json({ error: "No se pudo crear la reserva" }, { status: 500 });
  }

  if (guestEmail && autoEmailEnabled) {
    try {
      const { data: checkinBlock } = await supabase
        .from("guide_blocks")
        .select("content")
        .eq("property_id", property.id)
        .eq("type", "checkin")
        .maybeSingle();

      const checkinTime =
        (checkinBlock?.content as { time?: string } | null)?.time ?? null;
      const guideUrl = getGuideUrl(property.slug);
      const qrCodeBuffer = await generateGuideQrCodeBuffer(property.slug);

      await sendBookingWelcomeEmail({
        guestEmail,
        guestName: data.guest_name,
        propertyName: property.name,
        coverImageUrl: property.cover_image_url,
        checkinDate: data.checkin_date,
        checkoutDate: data.checkout_date,
        checkinTime,
        guideUrl,
        qrCodeBuffer,
      });

      await supabase
        .from("bookings")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      booking.welcome_email_sent_at = new Date().toISOString();
    } catch {
      // Best-effort — the booking itself was created successfully even if
      // the welcome email failed to send (missing RESEND_API_KEY, Resend
      // outage, etc.), same pattern as the other transactional emails.
    }
  }

  return NextResponse.json({ booking });
}
