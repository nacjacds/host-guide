"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";

export function WelcomeMessage({
  message,
  hostName,
  hostAvatarUrl,
  translated,
}: {
  message: string;
  hostName: string | null;
  hostAvatarUrl?: string | null;
  translated: string | null;
}) {
  const { locale, propertyId, sourceLocale, t } = useGuideLocale();
  const [fallback, setFallback] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (locale === sourceLocale || translated || requested.current) return;
    requested.current = true;

    let cancelled = false;
    fetch("/api/guide/translate-block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        targetLocale: locale,
        blockType: "welcome_message",
        blockId: null,
        content: message,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { translated: string | null } | null) => {
        if (!cancelled && data?.translated) setFallback(data.translated);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [locale, sourceLocale, translated, propertyId, message]);

  const displayMessage = locale === sourceLocale ? message : (translated ?? fallback ?? message);

  return (
    <div className="mx-4 flex items-start gap-4 py-8 sm:mx-6 sm:py-10 lg:mx-8">
      {hostName && (
        <Avatar className="size-14 shrink-0">
          {hostAvatarUrl && <AvatarImage src={hostAvatarUrl} alt={hostName} />}
          <AvatarFallback className="text-sm font-medium">
            {getInitials(hostName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        {hostName && (
          <p className="text-sm font-medium text-neutral-600">
            {t("hostIntroLabel")}: {hostName}
          </p>
        )}
        <p className={cn("text-base text-neutral-600 italic", hostName && "mt-1")}>
          {displayMessage}
        </p>
      </div>
    </div>
  );
}
