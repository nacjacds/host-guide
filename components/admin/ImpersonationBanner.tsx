"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner({ hostLabel }: { hostLabel: string }) {
  const t = useTranslations("dashboard.admin.impersonation");
  const tCommon = useTranslations("dashboard.common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  async function handleStop() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/impersonate/stop", { method: "POST" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? t("stopError"));
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error(tCommon("networkError"));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white">
      <span>{t("banner", { host: hostLabel })}</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleStop}
        disabled={loading}
      >
        {loading ? t("returning") : t("backToAdmin")}
      </Button>
    </div>
  );
}
