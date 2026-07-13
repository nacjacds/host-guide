"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CheckinContent {
  time: string;
  instructions: string;
}

export function CheckinBlock({
  content,
  onChange,
}: {
  content: CheckinContent;
  onChange: (content: CheckinContent) => void;
}) {
  const t = useTranslations("dashboard.editor.blocks.checkin");

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="time">{t("time")}</Label>
        <Input
          id="time"
          type="time"
          value={content.time ?? ""}
          onChange={(e) => onChange({ ...content, time: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="instructions">{t("instructions")}</Label>
        <Textarea
          id="instructions"
          value={content.instructions ?? ""}
          onChange={(e) => onChange({ ...content, instructions: e.target.value })}
        />
      </div>
    </div>
  );
}
