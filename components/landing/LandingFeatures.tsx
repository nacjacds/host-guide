"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { HouseGuideIcon, TranslationIcon, AiPinIcon, PrintableQrIcon } from "./FeatureIcons";

const ICONS = [HouseGuideIcon, TranslationIcon, AiPinIcon, PrintableQrIcon];

export function LandingFeatures() {
  const t = useTranslations("landing.features");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section id="features" className="scroll-mt-20 bg-[#FAFAF8] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium tracking-wide text-[#FF4200] uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-balance text-[#1A1A18] sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                className="flex flex-col items-center rounded-2xl border border-[#DDD8CC] bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <Icon className="mb-4 size-20 sm:size-24" />
                <h3 className="mb-1.5 text-base font-semibold text-[#1A1A18]">{item.title}</h3>
                <p className="max-w-[26ch] text-sm leading-relaxed text-[#6B6B67]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
