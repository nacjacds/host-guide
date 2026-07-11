"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LandingFinalCta() {
  const t = useTranslations("landing.finalCta");

  return (
    <section className="relative bg-[#1B4F72]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.svg" alt="WelcoKit" className="mx-auto mb-6 h-9 w-auto" />
          <h2 className="font-serif text-3xl font-semibold text-balance text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/80">{t("subtitle")}</p>
          <Button
            size="lg"
            className="mt-8 bg-[#FF4200] text-white hover:bg-[#e03a00]"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            {t("cta")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
