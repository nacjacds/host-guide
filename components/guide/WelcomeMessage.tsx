"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { useTranslatedText } from "./useTranslatedText";

export function WelcomeMessage({
  message,
  hostName,
  hostAvatarUrl,
}: {
  message: string;
  hostName: string | null;
  hostAvatarUrl?: string | null;
}) {
  const translated = useTranslatedText(message);

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
          <p className="text-sm font-medium text-neutral-600">Hola, soy {hostName}</p>
        )}
        <p className={cn("text-base text-neutral-600 italic", hostName && "mt-1")}>
          {translated}
        </p>
      </div>
    </div>
  );
}
