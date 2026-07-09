import Image from "next/image";
import type { Property } from "@/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function HeroSection({ property }: { property: Property }) {
  const hasCoverImage = Boolean(property.cover_image_url);

  return (
    <div className="relative flex h-64 w-full flex-col justify-end overflow-hidden rounded-b-3xl">
      {hasCoverImage ? (
        <>
          <Image
            src={property.cover_image_url!}
            alt={property.name}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: property.accent_color }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </>
      )}
      <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="WelcoKit"
          style={{ width: "180px", height: "auto" }}
          className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div
        className="relative z-10 p-6 text-white"
        style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)" }}
      >
        <h1 className="text-xl font-bold sm:text-2xl">{property.name}</h1>
        {property.address && (
          <p className="text-sm font-light text-white/80">{property.address}</p>
        )}
      </div>
    </div>
  );
}
