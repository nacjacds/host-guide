import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { triggerWelcomeMessageTranslation } from "@/lib/translations/trigger";
import { resolvePropertySourceLocale } from "@/lib/translations/constants";
import { geocodeAddress } from "@/lib/google-places";
import { isValidPhoneNumber } from "@/lib/phone";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const updatePropertySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  address: z.string().min(1).max(255).optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  host_tone: z.enum(["friendly", "formal"]).optional(),
  language: z.string().min(2).max(5).optional(),
  destination_type: z.enum(["beach", "historic_city", "nature", "rural", "urban"]).optional(),
  // Guest-facing contact phone — gates the WhatsApp button in the public
  // guide (see WhatsAppFab.tsx: renders nothing at all if this, and the
  // profiles.phone fallback, are both empty).
  whatsapp_number: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: "Introduce un teléfono válido: código de país + número (8-15 dígitos)",
    }),
  welcome_message: z.string().max(500).nullable().optional(),
  airbnb_url: z.string().max(500).nullable().optional(),
  bedrooms: z.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.number().int().min(0).max(50).nullable().optional(),
  max_guests: z.number().int().min(0).max(100).nullable().optional(),
  is_published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return notFoundResponse(request, supabase, null, "property");
  }

  return NextResponse.json({ property });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = updatePropertySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updateData: typeof parsed.data & { lat?: number | null; lng?: number | null } = {
    ...parsed.data,
  };

  // Re-geocode whenever the address changes — local recommendation search
  // and distance calculations depend on having up-to-date coordinates.
  if (parsed.data.address !== undefined) {
    const coords = await geocodeAddress(parsed.data.address);
    updateData.lat = coords?.lat ?? null;
    updateData.lng = coords?.lng ?? null;
  }

  const { data: property, error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", id)
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error || !property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  if (parsed.data.welcome_message !== undefined) {
    triggerWelcomeMessageTranslation(
      property.id,
      property.welcome_message,
      resolvePropertySourceLocale(property.language)
    );
  }

  return NextResponse.json({ property });
}

const deleteRequestSchema = z.object({
  // Type-to-confirm friction on the client (see DeletePropertyButton.tsx) —
  // re-checked here too, since this is a meaningful, if recoverable,
  // action and the client-side check alone is trivially bypassable via a
  // raw fetch call.
  confirmName: z.string(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = deleteRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "Falta confirmar el nombre de la propiedad",
          "Missing confirmation of the property name"
        ),
      },
      { status: 400 }
    );
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", id)
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!property) {
    return notFoundResponse(request, supabase, user.id, "property");
  }

  if (parsed.data.confirmName !== property.name) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "El nombre no coincide", "The name doesn't match") },
      { status: 400 }
    );
  }

  // Soft delete only — see supabase/migrations/20260714090000_properties_soft_delete.sql.
  // Never touches any Stripe subscription: billing is account-level
  // (profiles.stripe_customer_id/plan), not per-property, so there is
  // nothing Stripe-side tied to this one property to cancel. The host's
  // current plan is captured here purely so a super admin reviewing
  // deleted properties can see whether the host was on a paid plan at
  // deletion time, in case that warrants a manual billing follow-up.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("properties")
    .update({ deleted_at: new Date().toISOString(), deleted_by_host_plan: profile?.plan ?? null })
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
