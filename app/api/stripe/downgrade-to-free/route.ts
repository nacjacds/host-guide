import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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
      const message = err instanceof Error ? err.message : "No se pudo cancelar la suscripción";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { error } = await supabase.from("profiles").update({ plan: "free" }).eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
