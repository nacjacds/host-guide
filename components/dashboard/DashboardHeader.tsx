"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ hasProperties }: { hasProperties: boolean }) {
  const t = useTranslations("dashboard.properties");

  return (
    <PageHeader
      title={t("title")}
      action={
        hasProperties ? (
          <Button nativeButton={false} render={<Link href="/properties/new" />}>
            {t("addNew")}
          </Button>
        ) : undefined
      }
    />
  );
}
