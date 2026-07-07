"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OnboardingProgressBar } from "./OnboardingProgressBar";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import type { GuideBlock, Property } from "@/types";

const STEP_KEY = "onboarding_step";
const PROPERTY_KEY = "onboarding_property_id";
const COMPLETED_KEY = "onboarding_completed";

export function OnboardingWizard() {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [property, setProperty] = useState<Property | null>(null);
  const [blocks, setBlocks] = useState<GuideBlock[]>([]);

  useEffect(() => {
    if (window.localStorage.getItem(COMPLETED_KEY) === "true") {
      setCompleted(true);
      setReady(true);
      return;
    }

    const storedPropertyId = window.localStorage.getItem(PROPERTY_KEY);
    const storedStep = window.localStorage.getItem(STEP_KEY);

    if (!storedPropertyId) {
      setReady(true);
      return;
    }

    fetch(`/api/properties/${storedPropertyId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ property: fetched }: { property: Property }) => {
        setProperty(fetched);
        setStep(storedStep === "2" ? 2 : 1);
      })
      .catch(() => {
        window.localStorage.removeItem(PROPERTY_KEY);
        window.localStorage.removeItem(STEP_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  function handleStep1Created(created: Property) {
    setProperty(created);
    window.localStorage.setItem(PROPERTY_KEY, created.id);
    window.localStorage.setItem(STEP_KEY, "2");
    setStep(2);
  }

  function handleStep2Done(createdBlocks: GuideBlock[]) {
    setBlocks(createdBlocks);
    setStep(3);
  }

  function handleFinish() {
    window.localStorage.setItem(COMPLETED_KEY, "true");
    window.localStorage.removeItem(PROPERTY_KEY);
    window.localStorage.removeItem(STEP_KEY);
  }

  if (!ready) return null;

  if (completed) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground">
          Todavía no tienes propiedades. Crea la primera para generar tu guía digital.
        </p>
        <Link href="/properties/new" className="text-sm font-medium underline underline-offset-2">
          Crear propiedad
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <OnboardingProgressBar step={step} />

      {step === 1 && <OnboardingStep1 onCreated={handleStep1Created} />}
      {step === 2 && property && (
        <OnboardingStep2 propertyId={property.id} onDone={handleStep2Done} />
      )}
      {step === 3 && property && (
        <OnboardingStep3 property={property} blocks={blocks} onFinish={handleFinish} />
      )}
    </div>
  );
}
