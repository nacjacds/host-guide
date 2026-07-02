import { Button } from "@/components/ui/button";
import type { Property } from "@/types";

export function ContactButtons({ property }: { property: Property }) {
  if (!property.whatsapp_number) return null;

  const whatsappHref = `https://wa.me/${property.whatsapp_number.replace(/\D/g, "")}`;

  return (
    <div className="flex justify-center gap-3 p-6">
      <Button
        style={{ backgroundColor: property.accent_color }}
        render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
      >
        Contactar por WhatsApp
      </Button>
    </div>
  );
}
