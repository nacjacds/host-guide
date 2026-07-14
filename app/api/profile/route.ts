import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isValidPhoneNumber } from "@/lib/phone";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const updateProfileSchema = z.object({
  full_name: z.string().max(120).nullable().optional(),
  // Fallback source for the guest-facing WhatsApp button when a property
  // has no whatsapp_number of its own (see app/guide/[slug]/layout.tsx) —
  // validated the same way as that field.
  phone: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: "Introduce un teléfono válido: código de país + número (8-15 dígitos)",
    }),
  // Dashboard UI language — independent from properties.language/
  // content_translations, which control the guest-facing guide instead.
  dashboard_locale: z.enum(["es", "en"]).optional(),
});

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .select()
    .single();

  if (error || !profile) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo guardar el perfil", "Couldn't save the profile") },
      { status: 400 }
    );
  }

  return NextResponse.json({ profile });
}
