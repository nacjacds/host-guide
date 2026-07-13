// Shared phone validation for the two fields that feed the guest-facing
// WhatsApp contact button: properties.whatsapp_number (per-property) and
// profiles.phone (host-wide fallback when a property has none set — see
// app/guide/[slug]/layout.tsx). Neither had real format validation before,
// only a client-side digit-strip with no length/shape check.

// Accepts country code + number as plain digits (8-15 total, roughly a
// national number plus a 1-3 digit country code) — lenient enough to allow
// "+34 600 000 000", "34-600-000-000", or "34600000000" as input, since we
// validate after stripping everything that isn't a digit.
const PHONE_DIGITS_REGEX = /^\d{8,15}$/;

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_DIGITS_REGEX.test(sanitizePhoneDigits(value));
}
