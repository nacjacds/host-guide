import Image from "next/image";
import type { Property } from "@/types";

export function HeroSection({ property }: { property: Property }) {
  return (
    <div className="relative flex h-64 w-full flex-col justify-end overflow-hidden rounded-b-3xl">
      {property.cover_image_url ? (
        <Image
          src={property.cover_image_url}
          alt={property.name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: property.accent_color }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative z-10 p-6 text-white">
        <h1 className="text-2xl font-bold">{property.name}</h1>
        {property.address && (
          <p className="text-sm text-white/80">{property.address}</p>
        )}
      </div>
    </div>
  );
}
