export const ADMIN_ALLOWED_EMAIL =
  normalizeAdminEmail(process.env.ADMIN_ALLOWED_EMAIL) || "admin@momentbook.app";

export function normalizeAdminEmail(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isAllowedAdminEmail(
  value: string | null | undefined,
): boolean {
  return normalizeAdminEmail(value) === ADMIN_ALLOWED_EMAIL;
}
