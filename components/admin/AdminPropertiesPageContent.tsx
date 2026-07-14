"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdminPropertiesTable,
  type AdminPropertyRow,
} from "@/components/admin/AdminPropertiesTable";

export function AdminPropertiesPageContent({ rows }: { rows: AdminPropertyRow[] }) {
  const t = useTranslations("dashboard.admin.propertiesPage");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1A1A18]">{t("title")}</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToPanel")}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allProperties", { count: rows.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPropertiesTable properties={rows} />
        </CardContent>
      </Card>
    </>
  );
}
