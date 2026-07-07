"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";

const SUPPORT_EMAIL = "ignajac@gmail.com";

export function ChangePlanDialog({ currentPlan }: { currentPlan: PlanId }) {
  const [open, setOpen] = useState(false);
  const currentPrice = PLANS[currentPlan].priceEurMonth;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Cambiar de plan</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Elige tu plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const isCurrent = planId === currentPlan;
              const isUpgrade = plan.priceEurMonth > currentPrice;

              return (
                <div
                  key={planId}
                  className={cn(
                    "rounded-lg border p-4",
                    isCurrent ? "border-primary ring-1 ring-primary" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{plan.label}</p>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Plan actual
                      </span>
                    )}
                  </div>
                  <p className="mt-1">
                    <span className="text-2xl font-bold">{plan.priceEurMonth}€</span>
                    <span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>
                  {!isCurrent && isUpgrade && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      render={
                        <a
                          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                            `Quiero pasarme al plan ${plan.label}`
                          )}`}
                        />
                      }
                      nativeButton={false}
                    >
                      Contactar para actualizar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
