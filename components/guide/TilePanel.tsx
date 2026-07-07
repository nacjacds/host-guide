import { Check } from "lucide-react";
import type { GuideBlock } from "@/types";

export function TilePanel({
  block,
  accentColor,
}: {
  block: GuideBlock;
  accentColor: string;
}) {
  const content = block.content as Record<string, unknown>;

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
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{String(value)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
