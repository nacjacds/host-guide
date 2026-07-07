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
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="general">Emergencias generales</Label>
        <Input
          id="general"
          placeholder="112"
          value={content.general ?? ""}
          onChange={(e) => onChange({ ...content, general: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="police">Policía</Label>
        <Input
          id="police"
          value={content.police ?? ""}
          onChange={(e) => onChange({ ...content, police: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ambulance">Ambulancia</Label>
        <Input
          id="ambulance"
          value={content.ambulance ?? ""}
          onChange={(e) => onChange({ ...content, ambulance: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="firefighters">Bomberos</Label>
        <Input
          id="firefighters"
          value={content.firefighters ?? ""}
          onChange={(e) => onChange({ ...content, firefighters: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="hospital">Hospital más cercano</Label>
        <Input
          id="hospital"
          placeholder="Nombre y/o teléfono"
          value={content.hospital ?? ""}
          onChange={(e) => onChange({ ...content, hospital: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={content.notes ?? ""}
          onChange={(e) => onChange({ ...content, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
