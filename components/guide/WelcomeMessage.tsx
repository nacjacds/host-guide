"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
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
    <div className="mx-4 my-6 rounded-2xl bg-amber-50 p-6 sm:mx-6 lg:mx-8">
      {hostName && (
        <div className="mb-3 flex items-center gap-2">
          <Avatar className="size-12">
            {hostAvatarUrl && <AvatarImage src={hostAvatarUrl} alt={hostName} />}
            <AvatarFallback className="text-sm font-medium">
              {getInitials(hostName)}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium text-neutral-600">Hola, soy {hostName}</p>
        </div>
      )}
      <p className="font-serif text-5xl leading-none text-amber-300">&ldquo;</p>
      <p className="-mt-5 text-base text-neutral-700 italic">{translated}</p>
    </div>
  );
}
