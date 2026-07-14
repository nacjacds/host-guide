"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PlanDefinition } from "@/lib/plans";

export function PropertyLimitNotice({
  plan,
  count,
}: {
  plan: PlanDefinition;
  count: number;
}) {
  const t = useTranslations("dashboard.properties.limitNotice");
  const tPlans = useTranslations("dashboard.plans");

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <TriangleAlertIcon className="size-8 text-amber-500" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            {t("message", {
              plan: tPlans(`${plan.id}.label`),
              count,
              max: plan.maxProperties,
            })}
          </p>
          <Button nativeButton={false} render={<Link href="/account" />} className="mt-1">
            {t("upgradePlan")}
          </Button>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {t("backToProperties")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
