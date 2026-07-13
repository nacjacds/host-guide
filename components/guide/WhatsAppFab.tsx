"use client";

import { MessageCircle } from "lucide-react";
import { useGuideLocale } from "./GuideLocaleProvider";

const WHATSAPP_GREEN = "#25D366";

export function WhatsAppFab({ whatsappNumber }: { whatsappNumber: string | null }) {
  const { t, propertyId } = useGuideLocale();

  if (!whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  function handleClick() {
    fetch("/api/guide/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, event_type: "whatsapp_clicked" }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never block or break the guest's action.
    });
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 sm:justify-end sm:px-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{ backgroundColor: WHATSAPP_GREEN }}
        className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/25 transition-transform hover:scale-105"
      >
        <MessageCircle size={20} strokeWidth={1.5} />
        {t("contactHost")}
      </a>
    </div>
  );
}
