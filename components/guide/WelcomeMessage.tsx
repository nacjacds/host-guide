"use client";

import { useTranslatedText } from "./useTranslatedText";

export function WelcomeMessage({
  message,
  hostName,
}: {
  message: string;
  hostName: string | null;
}) {
  const translated = useTranslatedText(message);

  return (
    <div className="mx-4 my-6 rounded-2xl bg-amber-50 p-6 sm:mx-6 lg:mx-8">
      <p className="font-serif text-5xl leading-none text-amber-300">&ldquo;</p>
      <p className="-mt-5 text-base text-neutral-700 italic">{translated}</p>
      {hostName && (
        <p className="mt-3 text-right text-sm font-medium text-neutral-500">— {hostName}</p>
      )}
    </div>
  );
}
