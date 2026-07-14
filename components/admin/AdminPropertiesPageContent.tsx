"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminPropertiesTable,
  type AdminPropertyRow,
} from "@/components/admin/AdminPropertiesTable";
import { AdminPropertiesGroupedByHost } from "@/components/admin/AdminPropertiesGroupedByHost";

type ViewMode = "flat" | "grouped";

export function AdminPropertiesPageContent({ rows }: { rows: AdminPropertyRow[] }) {
  const t = useTranslations("dashboard.admin.propertiesPage");
  // Lifted here (not inside either table) so switching views is instant and
  // never remounts/resets whatever search or filter state a future version
  // of this page adds above the tables.
  const [view, setView] = useState<ViewMode>("flat");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1A1A18]">{t("title")}</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToPanel")}
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>{t("allProperties", { count: rows.length })}</CardTitle>
          <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
            <TabsList variant="line">
              <TabsTrigger value="flat">{t("viewFlat")}</TabsTrigger>
              <TabsTrigger value="grouped">{t("viewGrouped")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {view === "flat" ? (
            <AdminPropertiesTable properties={rows} />
          ) : (
            <AdminPropertiesGroupedByHost properties={rows} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
