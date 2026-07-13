"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Home, Languages, Sparkles, QrCode, type LucideIcon } from "lucide-react";

const ICONS: LucideIcon[] = [Home, Languages, Sparkles, QrCode];

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
                className="rounded-2xl border border-[#DDD8CC] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#1B4F72]/8">
                  <Icon size={22} strokeWidth={1.5} color="#1B4F72" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-[#1A1A18]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B6B67]">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
