"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import type { PaidPlanId } from "@/lib/stripe";

// Plan tier names/feature bullet lists (lib/plans.ts) are not translated
// yet — a deliberate Fase 1 gap, since restructuring lib/plans.ts into a
// locale-aware shape is bigger than this component and out of scope here.
export function ChangePlanDialog({
  currentPlan,
  hasStripeCustomer,
}: {
  currentPlan: PlanId;
  hasStripeCustomer: boolean;
}) {
  const t = useTranslations("dashboard.account.plan");
  const tAccount = useTranslations("dashboard.account");
  const tCommon = useTranslations("dashboard.common");
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
        toast.error(error ?? t("checkoutError"));
        return;
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      toast.error(tCommon("networkError"));
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
        toast.error(error ?? t("portalError"));
        return;
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      toast.error(tCommon("networkError"));
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
        toast.error(error ?? t("downgradeError"));
        return;
      }
      toast.success(t("downgradeSuccess"));
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setDowngrading(false);
    }
  }

  if (currentPlan !== "free" && hasStripeCustomer) {
    return (
      <Button variant="outline" onClick={handlePortal} disabled={loadingPortal}>
        {loadingPortal ? t("opening") : t("managePlan")}
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t("changePlan")}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("choosePlan")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="font-semibold">{PLANS.free.label}</p>
              <p className="mt-1">
                <span className="text-2xl font-bold">{PLANS.free.priceEurMonth}€</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {tAccount("perMonth")}
                </span>
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
                  {downgrading ? t("changing") : t("changeToFree")}
                </Button>
              ) : (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("currentPlanLabel")}
                </p>
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
                      <span className="text-sm font-normal text-muted-foreground">
                        {tAccount("perMonth")}
                      </span>
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
                      {loadingPlan === planId ? t("redirecting") : t("update")}
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
