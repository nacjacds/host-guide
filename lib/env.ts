// Shared, framework-agnostic env var accessors — safe to import from both
// server code and "use client" components (NEXT_PUBLIC_ vars are inlined
// into the browser bundle at build time either way). Kept separate from
// lib/stripe.ts so client components don't have to pull in the server-only
// Stripe SDK just to build an absolute URL.

// Several features (Stripe checkout/portal return URLs, QR codes, the
// share-guide link) need an absolute app URL. A missing env var here used
// to silently degrade to "" or "undefined", producing broken relative URLs
// or literal "undefined/..." strings. Throwing instead gives an
// immediately diagnosable error rather than a confusing downstream failure.
export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("Falta configurar NEXT_PUBLIC_APP_URL");
  return appUrl;
}
