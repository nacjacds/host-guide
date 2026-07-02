import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface WifiContent {
  network_name: string;
  password: string;
}

export function WifiBlock({
  content,
  onChange,
}: {
  content: WifiContent;
  onChange: (content: WifiContent) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="network_name">Nombre de la red</Label>
        <Input
          id="network_name"
          value={content.network_name ?? ""}
          onChange={(e) => onChange({ ...content, network_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          value={content.password ?? ""}
          onChange={(e) => onChange({ ...content, password: e.target.value })}
        />
      </div>
    </div>
  );
}
