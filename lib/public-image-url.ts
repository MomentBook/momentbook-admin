export const PUBLIC_IMAGE_ORIGIN_ENV_KEY = "NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN";

export const PRODUCTION_PUBLIC_IMAGE_ORIGIN =
  "https://d1mnbpnyxoksha.cloudfront.net";
export const DEVELOPMENT_PUBLIC_IMAGE_ORIGIN =
  "https://d17831w57uibmm.cloudfront.net";function resolveDefaultPublicImageOrigin(): string {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();

  if (appEnv === "production") {
    return PRODUCTION_PUBLIC_IMAGE_ORIGIN;
  }

  if (appEnv === "development") {
    return DEVELOPMENT_PUBLIC_IMAGE_ORIGIN;
  }

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_PUBLIC_IMAGE_ORIGIN
    : DEVELOPMENT_PUBLIC_IMAGE_ORIGIN;
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return null;
  }
}

export function resolvePublicImageOrigin(): string {
  return (
    normalizeOrigin(process.env[PUBLIC_IMAGE_ORIGIN_ENV_KEY]) ??
    resolveDefaultPublicImageOrigin()
  );
}

export function normalizePublicImageUrl(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
