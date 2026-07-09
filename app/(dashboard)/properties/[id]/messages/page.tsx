import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PropertyMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Property existence/ownership is already guarded by the parent layout.
  const { data: messages } = await supabase
    .from("guest_messages")
    .select("*")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        {!messages?.length && (
          <p className="text-muted-foreground">
            Todavía no has recibido mensajes en el libro de visitas.
          </p>
        )}
        {messages?.map((msg) => (
          <div key={msg.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{msg.name ?? "Anónimo"}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {msg.country && <span>{msg.country}</span>}
                <span>{new Date(msg.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
            <div className="mt-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={14}
                  className={value <= msg.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                />
              ))}
            </div>
            <p className="mt-2 text-sm">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
