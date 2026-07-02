import type { GuideBlock } from "@/types";

export function TilePanel({ block }: { block: GuideBlock }) {
  const content = block.content as Record<string, unknown>;

  return (
    <div className="space-y-3">
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          {Array.isArray(value) ? (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {value.map((item, i) => (
                <li key={i}>{String(item)}</li>
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
