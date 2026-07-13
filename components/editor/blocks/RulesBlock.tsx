"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface RulesContent {
  rules: string[];
}

export function RulesBlock({
  content,
  onChange,
}: {
  content: RulesContent;
  onChange: (content: RulesContent) => void;
}) {
  const t = useTranslations("dashboard.editor.blocks.rules");
  const tCommon = useTranslations("dashboard.common");
  const rules = content.rules ?? [];

  function updateRule(index: number, value: string) {
    const next = [...rules];
    next[index] = value;
    onChange({ rules: next });
  }

  function removeRule(index: number) {
    onChange({ rules: rules.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-2">
      {rules.map((rule, i) => (
        <div key={i} className="flex gap-2">
          <Input value={rule} onChange={(e) => updateRule(i, e.target.value)} />
          <Button variant="outline" size="sm" onClick={() => removeRule(i)}>
            {tCommon("delete")}
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange({ rules: [...rules, ""] })}
      >
        {t("addRule")}
      </Button>
    </div>
  );
}
