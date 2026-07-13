"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChangePlanDialog } from "@/components/account/ChangePlanDialog";
import type { PlanId } from "@/lib/plans";

export function AccountHeader({
  currentPlan,
  hasStripeCustomer,
}: {
  currentPlan: PlanId;
  hasStripeCustomer: boolean;
}) {
  const t = useTranslations("dashboard.account");

  return (
    <PageHeader
      title={t("title")}
      action={<ChangePlanDialog currentPlan={currentPlan} hasStripeCustomer={hasStripeCustomer} />}
    />
  );
}
