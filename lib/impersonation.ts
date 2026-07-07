import crypto from "crypto";

export const IMPERSONATION_COOKIE_NAME = "impersonation_return";
export const IMPERSONATION_MAX_AGE_SECONDS = 60 * 60;

interface ImpersonationPayload {
  adminId: string;
  refreshToken: string;
  issuedAt: number;
}

// Signed with the service-role key (server-only secret) so a forged cookie
// value can never be used to restore an arbitrary session — only tokens this
// server itself issued will verify.
function sign(data: string): string {
  return crypto
    .createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(data)
    .digest("base64url");
}

export function encodeImpersonationToken(payload: ImpersonationPayload): string {
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${json}.${sign(json)}`;
}

export function decodeImpersonationToken(token: string): ImpersonationPayload | null {
  const [json, signature] = token.split(".");
  if (!json || !signature || sign(json) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(json, "base64url").toString()) as ImpersonationPayload;
    if (Date.now() - payload.issuedAt > IMPERSONATION_MAX_AGE_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
