"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { WifiBlock, type WifiContent } from "./blocks/WifiBlock";
import { CheckinBlock, type CheckinContent } from "./blocks/CheckinBlock";
import { RulesBlock, type RulesContent } from "./blocks/RulesBlock";
import { CustomBlock, type CustomContent } from "./blocks/CustomBlock";
import type { GuideBlock } from "@/types";

export function BlockEditor({
  block,
  onChange,
}: {
  block: GuideBlock;
  onChange: (block: GuideBlock) => void;
}) {
  function updateContent<T extends object>(content: T) {
    onChange({ ...block, content: content as unknown as Record<string, unknown> });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{block.title ?? block.type}</CardTitle>
        <Switch
          checked={block.is_visible}
          onCheckedChange={(checked) => onChange({ ...block, is_visible: checked })}
        />
      </CardHeader>
      <CardContent>
        {block.type === "wifi" && (
          <WifiBlock
            content={block.content as unknown as WifiContent}
            onChange={updateContent}
          />
        )}
        {(block.type === "checkin" || block.type === "checkout") && (
          <CheckinBlock
            content={block.content as unknown as CheckinContent}
            onChange={updateContent}
          />
        )}
        {(block.type === "rules" || block.type === "parking" || block.type === "appliances") && (
          <RulesBlock
            content={block.content as unknown as RulesContent}
            onChange={updateContent}
          />
        )}
        {block.type === "custom" && (
          <CustomBlock
            title={block.title ?? ""}
            content={block.content as unknown as CustomContent}
            onTitleChange={(title) => onChange({ ...block, title })}
            onChange={updateContent}
          />
        )}
      </CardContent>
    </Card>
  );
}
