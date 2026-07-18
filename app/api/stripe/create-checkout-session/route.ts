import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getPlanPriceId, type PaidPlanId } from "@/lib/stripe";
import { getAppUrl } from "@/lib/env";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { apiMessage, pick } from "@/lib/apiMessages";

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
    return NextResponse.json({ error: apiMessage("invalidPlan", locale) }, { status: 400 });
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
    const appUrl = getAppUrl();

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
    } else {
      // Safeguard against creating a second, independent subscription.
      // ChangePlanDialog only ever renders this checkout flow when the host
      // has no active plan yet, but that check is client-side state that
      // can go stale (double-submit, a second tab, a delayed webhook before
      // the page refetches) — without this, Stripe would happily create a
      // brand-new subscription alongside the existing one instead of
      // replacing it (confirmed in the sandbox: two simultaneous active
      // subscriptions on the same customer). Redirecting to the Customer
      // Portal here mirrors exactly what the UI would have shown had its
      // state not been stale — no error round-trip, no dead end.
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });
      const hasBillableSubscription = existingSubscriptions.data.some(
        (sub) => sub.status === "active" || sub.status === "trialing"
      );

      if (hasBillableSubscription) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${appUrl}/account`,
        });
        return NextResponse.json({ url: portalSession.url });
      }
    }

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
