import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Recommendation } from "@/types";

export function RecommendationsBlock({
  recommendations,
  onToggleVisible,
}: {
  recommendations: Recommendation[];
  onToggleVisible: (id: string, visible: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{rec.name}</CardTitle>
            <Switch
              checked={rec.is_visible}
              onCheckedChange={(checked) => onToggleVisible(rec.id, checked)}
            />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{rec.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
