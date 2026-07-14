import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getPlanPriceId, type PaidPlanId } from "@/lib/stripe";
import { getAppUrl } from "@/lib/env";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { commonApiMessages, pick } from "@/lib/apiMessages";

const createCheckoutSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const parsed = createCheckoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json({ error: commonApiMessages.invalidPlan[locale] }, { status: 400 });
  }
  const plan: PaidPlanId = parsed.data.plan;

  try {
    const stripe = getStripe();
    const priceId = getPlanPriceId(plan);

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/account`,
      client_reference_id: user.id,
    });

    if (!session.url) {
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json(
        { error: pick(locale, "No se pudo crear la sesión de pago", "Couldn't create the checkout session") },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    const locale = await getApiLocale(request, supabase, user.id);
    return NextResponse.json(
      { error: pick(locale, "No se pudo iniciar el pago", "Couldn't start the checkout") },
      { status: 500 }
    );
  }
}
