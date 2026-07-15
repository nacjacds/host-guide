// Only ever follows a same-site path — never an absolute/protocol-relative
// URL — so a crafted `?returnTo=` query string can't be used as an open
// redirect off a standalone page (login, register, forgot/reset-password,
// admin).
export function safeReturnTo(returnTo: string | undefined, fallback = "/"): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}
