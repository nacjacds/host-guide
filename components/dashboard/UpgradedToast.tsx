"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function UpgradedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("¡Plan actualizado correctamente!");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null;
}
