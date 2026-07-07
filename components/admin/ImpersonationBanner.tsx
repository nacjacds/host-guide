"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner({ hostLabel }: { hostLabel: string }) {
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
        toast.error(error ?? "No se pudo volver a la cuenta de administrador");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Error de red");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white">
      <span>Estás viendo el panel como {hostLabel} — modo impersonación</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleStop}
        disabled={loading}
      >
        {loading ? "Volviendo..." : "Volver a admin"}
      </Button>
    </div>
  );
}
