"use client";

import { useGuideLocale } from "./GuideLocaleProvider";
import type { GuideBlock } from "@/types";
import type { GuideTranslationKey } from "@/lib/guide-i18n";

interface EmergencyContent {
  general?: string;
  police?: string;
  ambulance?: string;
  firefighters?: string;
  hospital?: string;
  notes?: string;
}

const FIELD_ORDER: Array<{ key: keyof EmergencyContent; labelKey: GuideTranslationKey }> = [
  { key: "general", labelKey: "emergency_general" },
  { key: "police", labelKey: "emergency_police" },
  { key: "ambulance", labelKey: "emergency_ambulance" },
  { key: "firefighters", labelKey: "emergency_firefighters" },
  { key: "hospital", labelKey: "emergency_hospital" },
];

export function EmergencyPanel({ block }: { block: GuideBlock }) {
  const { t } = useGuideLocale();
  const content = block.content as unknown as EmergencyContent;

  const rows = FIELD_ORDER.filter((field) => content[field.key]);

  return (
    <div className="space-y-3 rounded-xl border-2 border-destructive/50 bg-destructive/5 p-4">
      {rows.map(({ key, labelKey }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-3 border-b border-destructive/20 pb-2 last:border-0 last:pb-0"
        >
          <span className="text-sm font-medium text-destructive">{t(labelKey)}</span>
          <a
            href={`tel:${content[key]}`}
            className="text-sm font-semibold text-destructive underline underline-offset-2"
          >
            {content[key]}
          </a>
        </div>
      ))}
      {content.notes && <p className="pt-2 text-sm text-destructive/90">{content.notes}</p>}
    </div>
  );
}
