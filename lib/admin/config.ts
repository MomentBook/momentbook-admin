import "server-only";

export const ADMIN_ALLOWED_EMAIL =
  normalizeAdminEmail(process.env.ADMIN_ALLOWED_EMAIL) || null;

if (!ADMIN_ALLOWED_EMAIL) {
  throw new Error("Missing required server env: ADMIN_ALLOWED_EMAIL");
}

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
