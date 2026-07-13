"use client";

import { Wifi, KeyRound, Landmark, UtensilsCrossed, Music, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

const COVER_URL =
  "https://vgjafmanammabnlpbxqa.supabase.co/storage/v1/object/public/cover-images/1aa8a746-fabe-4659-afa6-b0dce952928d/cover.jpg";
const ACCENT = "#1B4F72";

const TILES = [
  { icon: Wifi, key: "wifi" },
  { icon: KeyRound, key: "checkin" },
  { icon: Landmark, key: "attractions" },
  { icon: UtensilsCrossed, key: "restaurants" },
  { icon: Music, key: "nightlife" },
  { icon: MapPin, key: "recommendations" },
] as const;

// The signature visual: a real guide (Carihuela Cristal — its accent color
// happens to be the brand's own #1B4F72) rendered like a door tag, string
// and hole included, tilted as if just handed to a guest.
export function GuidePreviewCard() {
  const t = useTranslations("landing.hero");

  return (
    <div className="relative mx-auto w-full max-w-[300px] rotate-3 transition-transform duration-500 hover:rotate-0 sm:max-w-[320px]">
      <svg
        viewBox="0 0 40 60"
        className="absolute -top-14 left-1/2 h-14 w-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <path
          d="M20,2 C8,18 8,38 20,52"
          fill="none"
          stroke="#FF4200"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-[-8px] left-1/2 size-4 -translate-x-1/2 rounded-full border-2 border-[#FF4200] bg-[#FAFAF8]" />

      <div className="overflow-hidden rounded-3xl border border-[#DDD8CC] bg-white shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={COVER_URL} alt="" className="h-40 w-full object-cover sm:h-44" />
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              C&N
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-[#6B6B67]">{t("previewHost")}</p>
              <p className="truncate text-sm font-medium text-[#1A1A18]">
                {t("previewGreeting")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TILES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#DDD8CC] bg-[#FAFAF8] py-2.5"
              >
                <Icon size={16} strokeWidth={1.5} color={ACCENT} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
