import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { notAuthenticatedResponse } from "@/lib/apiResponses";
import { getApiLocale } from "@/lib/apiLocale";
import { pick } from "@/lib/apiMessages";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notAuthenticatedResponse(request, supabase);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
      });
      await Promise.all(
        subscriptions.data
          .filter((sub) => sub.status === "active" || sub.status === "trialing" || sub.status === "past_due")
          .map((sub) => stripe.subscriptions.cancel(sub.id))
      );
    } catch (err) {
      if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
      const locale = await getApiLocale(request, supabase, user.id);
      return NextResponse.json(
        { error: pick(locale, "No se pudo cancelar la suscripción", "Couldn't cancel the subscription") },
        { status: 500 }
      );
    }
  }

  const { error } = await supabase.from("profiles").update({ plan: "free" }).eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
