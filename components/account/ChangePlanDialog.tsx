"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import type { PaidPlanId } from "@/lib/stripe";

export function ChangePlanDialog({
  currentPlan,
  hasStripeCustomer,
}: {
  currentPlan: PlanId;
  hasStripeCustomer: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanId | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [downgrading, setDowngrading] = useState(false);

  async function handleCheckout(plan: PaidPlanId) {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo iniciar el pago");
        return;
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      toast.error("Error de red");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo abrir el portal de facturación");
        return;
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      toast.error("Error de red");
    } finally {
      setLoadingPortal(false);
    }
  }

  async function handleDowngradeToFree() {
    setDowngrading(true);
    try {
      const response = await fetch("/api/stripe/downgrade-to-free", { method: "POST" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo cambiar al plan Free");
        return;
      }
      toast.success("Has cambiado al plan Free");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error de red");
    } finally {
      setDowngrading(false);
    }
  }

  if (currentPlan !== "free" && hasStripeCustomer) {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loadingPortal}>
        {loadingPortal ? "Abriendo..." : "Gestionar suscripción"}
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Cambiar de plan</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Elige tu plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold">{PLANS.free.label}</p>
              <p className="mt-1">
                <span className="text-2xl font-bold">{PLANS.free.priceEurMonth}€</span>
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {PLANS.free.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
              {currentPlan !== "free" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleDowngradeToFree}
                  disabled={downgrading}
                >
                  {downgrading ? "Cambiando..." : "Cambiar a Free"}
                </Button>
              ) : (
                <p className="mt-3 text-center text-xs text-muted-foreground">Plan actual</p>
              )}
            </div>

            {PLAN_ORDER.filter((planId): planId is PaidPlanId => planId !== "free").map(
              (planId) => {
                const plan = PLANS[planId];
                return (
                  <div key={planId} className="rounded-lg border border-border p-4">
                    <p className="font-semibold">{plan.label}</p>
                    <p className="mt-1">
                      <span className="text-2xl font-bold">{plan.priceEurMonth}€</span>
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature}>✓ {feature}</li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleCheckout(planId)}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === planId ? "Redirigiendo..." : "Actualizar"}
                    </Button>
                  </div>
                );
              }
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
