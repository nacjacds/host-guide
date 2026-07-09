import Stripe from "stripe";
import { loadStripe, type Stripe as StripeJS } from "@stripe/stripe-js";
import type { PlanId } from "@/lib/plans";

// Lazy singleton — constructing Stripe with a missing/empty key throws
// synchronously ("Neither apiKey nor config.authenticator provided"), which
// would otherwise crash on import for every route that pulls in this module
// before STRIPE_SECRET_KEY is configured. Callers get a normal catchable
// Error only when they actually try to use Stripe.
let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    // TEMPORARY diagnostic — remove once STRIPE_SECRET_KEY is confirmed
    // working. Never logs the key itself, only whether it reached the
    // server process and its shape (real Stripe secret keys start with
    // "sk_" and are 100+ characters).
    console.log("[stripe] STRIPE_SECRET_KEY check:", {
      present: Boolean(process.env.STRIPE_SECRET_KEY),
      length: process.env.STRIPE_SECRET_KEY?.length ?? 0,
      startsWithSk: process.env.STRIPE_SECRET_KEY?.startsWith("sk_") ?? false,
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Falta configurar STRIPE_SECRET_KEY");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Stripe requires absolute URLs for success_url/cancel_url — a missing env
// var here used to silently fall back to "", producing a relative URL that
// Stripe rejects with a cryptic "Not a valid URL" error. Throwing here
// instead gives an immediately diagnosable message.
export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("Falta configurar NEXT_PUBLIC_APP_URL");
  return appUrl;
}

export type PaidPlanId = Extract<PlanId, "starter" | "pro" | "agency">;

export function getPlanPriceId(plan: PaidPlanId): string {
  const priceIds: Record<PaidPlanId, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    agency: process.env.STRIPE_AGENCY_PRICE_ID,
  };
  const priceId = priceIds[plan];
  if (!priceId) throw new Error(`Falta el price ID de Stripe para el plan ${plan}`);
  return priceId;
}

export function getPriceIdToPlan(): Record<string, PaidPlanId> {
  return {
    [process.env.STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
    [process.env.STRIPE_PRO_PRICE_ID ?? ""]: "pro",
    [process.env.STRIPE_AGENCY_PRICE_ID ?? ""]: "agency",
  };
}

// Client-side (browser) Stripe.js singleton — currently unused by the
// checkout flow itself (we redirect to Checkout Session's hosted `url`
// directly, Stripe's recommended approach over the legacy
// redirectToCheckout(sessionId) call), kept for future use of Stripe
// Elements/Embedded Checkout.
let stripeJsPromise: Promise<StripeJS | null> | undefined;

export function getStripeJs(): Promise<StripeJS | null> {
  if (!stripeJsPromise) {
    stripeJsPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripeJsPromise;
}
