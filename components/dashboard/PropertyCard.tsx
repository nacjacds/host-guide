"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

export function PropertyCard({ property }: { property: Property }) {
  const t = useTranslations("dashboard.properties.card");
  const hasCover = Boolean(property.cover_image_url);

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-36 w-full overflow-hidden">
        {hasCover ? (
          <>
            <Image
              src={property.cover_image_url!}
              alt={property.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: property.accent_color }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="size-10 text-white/50" strokeWidth={1.5} />
            </div>
          </>
        )}
        <span
          className={cn(
            "absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-medium",
            property.is_published
              ? "bg-green-100 text-green-800"
              : "bg-neutral-100 text-neutral-600"
          )}
        >
          {property.is_published ? t("published") : t("draft")}
        </span>
        <div
          className="absolute inset-x-0 bottom-0 p-3 text-white"
          style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)" }}
        >
          <p className="truncate text-base font-semibold">{property.name}</p>
        </div>
      </div>
      <div className="flex gap-2 p-3">
        <Link
          href={`/properties/${property.id}/edit`}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-center text-sm font-medium transition-colors hover:bg-accent/40"
        >
          {t("edit")}
        </Link>
      </div>
    </div>
  );
}
