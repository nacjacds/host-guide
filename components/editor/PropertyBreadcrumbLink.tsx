"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function PropertyBreadcrumbLink() {
  const t = useTranslations("dashboard.nav");

  return (
    <Link href="/dashboard" className="hover:text-foreground">
      {t("properties")}
    </Link>
  );
}
