export const SUPERADMIN_EMAIL = "ignajac@gmail.com";

export function isSuperAdmin(email: string | null | undefined): boolean {
  return email === SUPERADMIN_EMAIL;
}
