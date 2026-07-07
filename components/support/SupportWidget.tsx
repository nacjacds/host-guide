"use client";

import { useRef, useState } from "react";
import { Bug, Lightbulb, HelpCircle, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SupportTicketType } from "@/types";

const SUBJECT_MAX = 100;
const DESCRIPTION_MAX = 1000;
const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;

const OPTIONS: { type: SupportTicketType; label: string; icon: typeof Bug }[] = [
  { type: "bug", label: "Reportar un problema", icon: Bug },
  { type: "feature_request", label: "Sugerir una mejora", icon: Lightbulb },
  { type: "question", label: "Tengo una pregunta", icon: HelpCircle },
];

type Step = "menu" | "form" | "sent";

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [ticketType, setTicketType] = useState<SupportTicketType | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("menu");
    setTicketType(null);
    setSubject("");
    setDescription("");
    setScreenshot(null);
  }

  function handleToggle() {
    setOpen((prev) => {
      if (prev) reset();
      return !prev;
    });
  }

  function handleSelectType(type: SupportTicketType) {
    setTicketType(type);
    setStep("form");
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("La captura debe ser JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      toast.error("La captura no puede superar 2MB");
      return;
    }
    setScreenshot(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketType) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", ticketType);
      formData.append("subject", subject);
      formData.append("description", description);
      if (screenshot) formData.append("screenshot", screenshot);

      const response = await fetch("/api/support/tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo enviar el mensaje");
        return;
      }

      setStep("sent");
    } catch {
      toast.error("Error de red");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-border bg-card p-4 shadow-lg">
          {step === "menu" && (
            <div className="space-y-2">
              <p className="mb-2 text-sm font-medium">¿Cómo podemos ayudarte?</p>
              {OPTIONS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/40"
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {step === "form" && ticketType && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <button
                type="button"
                onClick={() => setStep("menu")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={14} />
                {OPTIONS.find((o) => o.type === ticketType)?.label}
              </button>
              <div>
                <Label htmlFor="ticket-subject">Asunto</Label>
                <Input
                  id="ticket-subject"
                  value={subject}
                  maxLength={SUBJECT_MAX}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ticket-description">Descripción</Label>
                <Textarea
                  id="ticket-description"
                  value={description}
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {description.length}/{DESCRIPTION_MAX}
                </p>
              </div>
              <div>
                <Label>Captura de pantalla (opcional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {screenshot ? screenshot.name : "Adjuntar imagen"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleScreenshotChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          )}

          {step === "sent" && (
            <div className="space-y-3 py-2 text-center">
              <p className="text-sm">
                Hemos recibido tu mensaje, te responderemos en 24h.
              </p>
              <Button variant="outline" size="sm" onClick={handleToggle}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={open ? "Cerrar ayuda" : "Abrir ayuda"}
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        )}
      >
        {open ? <X size={22} /> : <span className="text-xl font-semibold">?</span>}
      </button>
    </div>
  );
}
