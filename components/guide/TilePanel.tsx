"use client";

import { Check } from "lucide-react";
import { useTranslatedBlock } from "./useTranslatedBlock";
import type { PropertyTranslationsByLocale } from "@/lib/translations/lookup";
import type { GuideBlock } from "@/types";

export function TilePanel({
  block,
  accentColor,
  translationsByLocale,
}: {
  block: GuideBlock;
  accentColor: string;
  translationsByLocale: PropertyTranslationsByLocale;
}) {
  const { content } = useTranslatedBlock({
    blockType: block.type,
    blockId: block.id,
    content: block.content,
    translationsByLocale,
    skip: block.type === "wifi",
  });

  return (
    <div className="space-y-3">
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          {Array.isArray(value) ? (
            <ul className="divide-y divide-border text-sm">
              {value.map((item, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Check
                    size={18}
                    strokeWidth={1.5}
                    color={accentColor}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="whitespace-pre-wrap">{String(item)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{String(value)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
