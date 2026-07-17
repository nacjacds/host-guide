import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notAuthenticatedResponse, notFoundResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createGuestLinkSchema = z
  .object({
    checkin_date: dateSchema,
    checkout_date: dateSchema,
  })
  .refine((data) => data.checkout_date >= data.checkin_date, {
    message: "checkout_date must be on or after checkin_date",
    path: ["checkout_date"],
  });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = createGuestLinkSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      {
        error: pick(
          locale,
          "La fecha de check-out debe ser igual o posterior a la de check-in",
          "The check-out date must be on or after the check-in date"
        ),
      },
      { status: 400 }
    );
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

  const { data: link, error } = await supabase
    .from("guest_guide_links")
    .insert({
      property_id: propertyId,
      checkin_date: parsed.data.checkin_date,
      checkout_date: parsed.data.checkout_date,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link });
}
