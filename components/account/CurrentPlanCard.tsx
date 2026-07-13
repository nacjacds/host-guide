"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function CurrentPlanCard({
  planLabel,
  priceEurMonth,
}: {
  planLabel: string;
  priceEurMonth: number;
}) {
  const t = useTranslations("dashboard.account");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-normal">
          {t("currentPlan")}
          <span className="inline-flex items-center rounded-full border border-[#DDD8CC] bg-[#F5EFE6] px-3 py-1 text-sm font-medium text-[#1B4F72]">
            {planLabel} — {priceEurMonth}€{t("perMonth")}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
