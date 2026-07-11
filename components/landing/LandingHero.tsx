"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuidePreviewCard } from "./GuidePreviewCard";
import { RoofDivider } from "./RoofDivider";

export function LandingHero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-[#FAFAF8] pt-12 pb-0 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center rounded-full bg-[#C0603A]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#C0603A] uppercase">
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] font-bold text-balance text-[#1A1A18] sm:text-5xl lg:text-[3.4rem]">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-[#6B6B67] sm:text-lg lg:mx-0">
            {t("subhead")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              className="w-full bg-[#FF4200] text-white hover:bg-[#e03a00] sm:w-auto"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              {t("ctaPrimary")}
            </Button>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#1B4F72] transition-colors hover:text-[#123a56]"
            >
              {t("ctaSecondary")}
              <ArrowDown className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <GuidePreviewCard />
        </motion.div>
      </div>

      <div className="mt-14 sm:mt-20">
        <RoofDivider color="#F5EFE6" />
      </div>
    </section>
  );
}
