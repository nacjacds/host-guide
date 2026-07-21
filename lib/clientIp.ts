// Resolves the guest's real IP from the reverse proxy's forwarded headers
// (EasyPanel runs behind Traefik in production) — used only ephemerally,
// during the current request, to check the host's excluded-IP list and to
// derive city/country (see lib/geoip.ts). Never persisted anywhere.
export function getClientIp(headersList: Headers): string | null {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return headersList.get("x-real-ip");
}
