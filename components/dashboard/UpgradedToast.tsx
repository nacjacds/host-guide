"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function UpgradedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("dashboard.account.plan");

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success(t("upgradedToast"));
      router.replace("/dashboard");
    }
  }, [searchParams, router, t]);

  return null;
}
