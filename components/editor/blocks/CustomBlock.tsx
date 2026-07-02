import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CustomContent {
  text: string;
}

export function CustomBlock({
  title,
  content,
  onTitleChange,
  onChange,
}: {
  title: string;
  content: CustomContent;
  onTitleChange: (title: string) => void;
  onChange: (content: CustomContent) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="text">Contenido</Label>
        <Textarea
          id="text"
          value={content.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>
    </div>
  );
}
