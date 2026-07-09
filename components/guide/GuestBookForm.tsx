"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, PenLine, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuideLocale } from "./GuideLocaleProvider";
import { COUNTRIES } from "@/lib/countries";

const MESSAGE_MAX = 300;

export function GuestBookForm({
  slug,
  propertyId,
  accentColor,
}: {
  slug: string;
  propertyId: string;
  accentColor: string;
}) {
  const { t } = useGuideLocale();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setShowBackButton(true), 2000);
    return () => clearTimeout(timer);
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || !message.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/guide/guest-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          name: name || null,
          country: country || null,
          message,
          rating,
        }),
      });
      if (response.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-4 my-6 rounded-2xl border border-border bg-card p-6 text-center sm:mx-6 lg:mx-8">
        <p className="font-serif text-xl font-bold">{t("guestBookThanks")}</p>
        {showBackButton && (
          <Link
            href={`/guide/${slug}`}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {t("backToGuide")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-4 my-6 space-y-4 rounded-2xl border border-border bg-card p-6 sm:mx-6 lg:mx-8">
      <div className="text-center">
        <PenLine className="mx-auto mb-2 size-8" strokeWidth={1.5} color={accentColor} />
        <h2 className="font-serif text-xl font-bold">{t("guestBookTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("guestBookSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} ${t("guestBookRatingLabel")}`}
            >
              <Star
                size={28}
                strokeWidth={1.5}
                color={accentColor}
                fill={(hoverRating || rating) >= value ? accentColor : "transparent"}
              />
            </button>
          ))}
        </div>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("guestBookNameLabel")}
        />

        <Select value={country} onValueChange={(value) => setCountry(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("guestBookCountryPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <Textarea
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("guestBookMessageLabel")}
            rows={3}
            required
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {message.length}/{MESSAGE_MAX}
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || rating === 0 || !message.trim()}
          style={{ backgroundColor: accentColor }}
        >
          {submitting ? t("guestBookSending") : t("guestBookSubmit")}
        </Button>
      </form>
    </div>
  );
}
