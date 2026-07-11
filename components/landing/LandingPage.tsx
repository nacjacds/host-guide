"use client";

import { MotionConfig } from "framer-motion";
import { LandingLocaleProvider } from "./LandingLocaleProvider";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingProblemSolution } from "./LandingProblemSolution";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingPricing } from "./LandingPricing";
import { LandingFinalCta } from "./LandingFinalCta";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <LandingLocaleProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#FAFAF8]">
          <LandingHeader />
          <LandingHero />
          <LandingProblemSolution />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingPricing />
          <LandingFinalCta />
          <LandingFooter />
        </div>
      </MotionConfig>
    </LandingLocaleProvider>
  );
}
