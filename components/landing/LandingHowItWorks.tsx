"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function LandingHowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as { title: string; description: string }[];

  return (
    <section className="bg-[#F5EFE6] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium tracking-wide text-[#FF4200] uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-balance text-[#1A1A18] sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
          <div
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden h-px bg-[#DDD8CC] sm:block"
          />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full border-2 border-[#1B4F72] bg-[#F5EFE6] font-sans text-2xl font-bold text-[#1B4F72]">
                {i + 1}
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-[#1A1A18]">{step.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#6B6B67]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
