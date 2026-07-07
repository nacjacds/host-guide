import type { GuestLanguage } from "@/types";

// International dialing codes for Spanish-speaking countries. Any other
// (or missing) prefix suggests English — this is a UX suggestion only,
// never a forced/validated value.
const SPANISH_SPEAKING_PREFIXES = [
  "+34", // España
  "+54", // Argentina
  "+52", // México
  "+57", // Colombia
  "+51", // Perú
  "+56", // Chile
  "+58", // Venezuela
  "+593", // Ecuador
];

export function suggestGuestLanguage(phone: string): GuestLanguage {
  const normalized = phone.replace(/[\s-]/g, "");
  if (!normalized.startsWith("+")) return "es";
  const isSpanishSpeaking = SPANISH_SPEAKING_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );
  return isSpanishSpeaking ? "es" : "en";
}
