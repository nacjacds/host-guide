"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EmergencyContent {
  general: string;
  police: string;
  ambulance: string;
  firefighters: string;
  hospital: string;
  notes: string;
}

export function EmergencyBlock({
  content,
  onChange,
}: {
  content: EmergencyContent;
  onChange: (content: EmergencyContent) => void;
}) {
  const t = useTranslations("dashboard.editor.blocks.emergency");

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="general">{t("general")}</Label>
        <Input
          id="general"
          placeholder={t("generalPlaceholder")}
          value={content.general ?? ""}
          onChange={(e) => onChange({ ...content, general: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="police">{t("police")}</Label>
        <Input
          id="police"
          value={content.police ?? ""}
          onChange={(e) => onChange({ ...content, police: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ambulance">{t("ambulance")}</Label>
        <Input
          id="ambulance"
          value={content.ambulance ?? ""}
          onChange={(e) => onChange({ ...content, ambulance: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="firefighters">{t("firefighters")}</Label>
        <Input
          id="firefighters"
          value={content.firefighters ?? ""}
          onChange={(e) => onChange({ ...content, firefighters: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="hospital">{t("hospital")}</Label>
        <Input
          id="hospital"
          placeholder={t("hospitalPlaceholder")}
          value={content.hospital ?? ""}
          onChange={(e) => onChange({ ...content, hospital: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          value={content.notes ?? ""}
          onChange={(e) => onChange({ ...content, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
