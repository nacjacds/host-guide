"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuideLocale } from "./GuideLocaleProvider";
import { TilePanel } from "./TilePanel";
import type { WifiContent } from "@/components/editor/blocks/WifiBlock";
import type { GuideBlock } from "@/types";

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function WifiPanel({
  block,
  accentColor,
  propertyId,
}: {
  block: GuideBlock;
  accentColor: string;
  propertyId: string;
}) {
  const { t } = useGuideLocale();
  const content = block.content as unknown as WifiContent;
  const storageKey = `wifi_connected_${propertyId}`;
  const [connected, setConnected] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setConnected(window.localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  useEffect(() => {
    if (!content.network_name || !content.password) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    const payload = `WIFI:T:WPA;S:${escapeWifiField(content.network_name)};P:${escapeWifiField(content.password)};;`;

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [content.network_name, content.password]);

  function handleConnect() {
    window.localStorage.setItem(storageKey, "true");
    setConnected(true);
  }

  function handleReset() {
    window.localStorage.removeItem(storageKey);
    setConnected(false);
  }

  return (
    <div className="space-y-4">
      <TilePanel block={block} accentColor={accentColor} translationsByLocale={{}} />

      {qrDataUrl && (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Código QR de WiFi"
            width={200}
            height={200}
            className="rounded-lg border border-border"
          />
          <p className="text-xs text-muted-foreground">{t("wifiScanToConnect")}</p>
        </div>
      )}

      {connected ? (
        <div className="flex items-start gap-2.5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-green-600" />
          <p>
            {t("wifiConnectedPrefix")} <strong>{content.network_name}</strong>{" "}
            {t("wifiConnectedSuffix")}{" "}
            <button
              type="button"
              onClick={handleReset}
              className="underline underline-offset-2 hover:text-green-900"
            >
              {t("wifiChangeNetwork")}
            </button>
          </p>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={handleConnect}>
          <Check size={16} strokeWidth={2} className="mr-1.5" />
          {t("wifiConnectButton")}
        </Button>
      )}
    </div>
  );
}
