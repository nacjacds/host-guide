"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminExcludedIpsSection } from "@/components/admin/AdminExcludedIpsSection";
import { BackLink } from "@/components/shared/BackLink";
import type { AnalyticsExcludedIp } from "@/types";

export function AdminExcludedIpsPageContent({
  initialExcludedIps,
}: {
  initialExcludedIps: AnalyticsExcludedIp[];
}) {
  const t = useTranslations("dashboard.admin.excludedIpsPage");

  return (
    <>
      <div>
        <BackLink href="/admin" label={t("backToPanel")} />
        <h1 className="text-2xl font-semibold text-[#1A1A18]">{t("title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("listTitle", { count: initialExcludedIps.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminExcludedIpsSection initialExcludedIps={initialExcludedIps} />
        </CardContent>
      </Card>
    </>
  );
}
