import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe, getPriceIdToPlan } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe" }, { status: 400 });
  }

  let stripe: ReturnType<typeof getStripe>;
  let event: Stripe.Event;
  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firma inválida";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const priceIdToPlan = getPriceIdToPlan();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceIdToPlan[priceId ?? ""] ?? "free";

      await supabase
        .from("profiles")
        .update({ plan, stripe_customer_id: customerId })
        .eq("stripe_customer_id", customerId);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const plan = isActive ? (priceIdToPlan[priceId ?? ""] ?? "free") : "free";

      await supabase
        .from("profiles")
        .update({ plan })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
