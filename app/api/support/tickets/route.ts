import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendSupportTicketNotification } from "@/lib/email";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { apiMessage, pick } from "@/lib/apiMessages";

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const ACCEPTED_SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createTicketSchema = z.object({
  type: z.enum(["bug", "feature_request", "question"]),
  subject: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const formData = await request.formData();
  const parsed = createTicketSchema.safeParse({
    type: formData.get("type"),
    subject: formData.get("subject"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: apiMessage("invalidData", locale) }, { status: 400 });
  }

  const screenshot = formData.get("screenshot");
  let screenshotUrl: string | null = null;

  if (screenshot instanceof File && screenshot.size > 0) {
    if (!ACCEPTED_SCREENSHOT_TYPES.includes(screenshot.type)) {
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json(
        { error: pick(locale, "La captura debe ser JPG, PNG o WebP", "The screenshot must be JPG, PNG, or WebP") },
        { status: 400 }
      );
    }
    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json(
        { error: pick(locale, "La captura no puede superar 2MB", "The screenshot can't be larger than 2MB") },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await screenshot.arrayBuffer());
    try {
      await sharp(inputBuffer).metadata();
    } catch {
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json({ error: apiMessage("notValidImage", locale) }, { status: 400 });
    }

    const extension = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("support-screenshots")
      .upload(path, inputBuffer, { contentType: screenshot.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("support-screenshots").getPublicUrl(path);
    screenshotUrl = publicUrl;
  }

  const { type, subject, description } = parsed.data;

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      type,
      subject,
      description,
      screenshot_url: screenshotUrl,
    })
    .select()
    .single();

  if (error || !ticket) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo enviar el ticket", "Couldn't send the ticket") },
      { status: 400 }
    );
  }

  try {
    await sendSupportTicketNotification({
      hostEmail: user.email ?? "desconocido",
      type,
      subject,
      description,
      screenshotUrl,
    });
  } catch {
    // Notification is best-effort — the ticket is already saved either way.
  }

  return NextResponse.json({ ticket }, { status: 201 });
}
