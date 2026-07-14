"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GuideBlock, Property } from "@/types";

export function OnboardingStep3({
  property,
  blocks,
  onFinish,
}: {
  property: Property;
  blocks: GuideBlock[];
  onFinish: () => void;
}) {
  const t = useTranslations("dashboard.onboarding.step3");
  const tCommon = useTranslations("dashboard.common");
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: true }),
      });

      if (!response.ok) {
        toast.error(t("publishError"));
        setPublishing(false);
        return;
      }

      window.open(`/guide/${property.slug}`, "_blank", "noopener,noreferrer");
      onFinish();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon("networkError"));
      setPublishing(false);
    }
  }

  function handleKeepEditing() {
    onFinish();
    router.push(`/properties/${property.id}/edit`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex justify-center">
        <div className="w-64 overflow-hidden rounded-[2rem] border-8 border-neutral-900 bg-white shadow-lg">
          <div className="relative h-28 w-full overflow-hidden">
            {property.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image_url}
                alt={property.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ backgroundColor: property.accent_color }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2 text-white">
              <p className="truncate text-xs font-bold">{property.name}</p>
              {property.address && (
                <p className="truncate text-[10px] text-white/80">{property.address}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 bg-neutral-50 p-2">
            {blocks.length === 0 ? (
              <p className="col-span-2 py-4 text-center text-[10px] text-muted-foreground">
                {t("noBlocksYet")}
              </p>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white py-2"
                >
                  <span className="text-base leading-none">{block.icon}</span>
                  <span className="truncate px-1 text-center text-[9px] font-medium text-neutral-700">
                    {block.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-sm flex-col gap-2">
        <Button className="w-full" onClick={handlePublish} disabled={publishing}>
          {publishing ? t("publishing") : t("publish")}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleKeepEditing}
          disabled={publishing}
        >
          {t("keepEditing")}
        </Button>
      </div>
    </div>
  );
}
