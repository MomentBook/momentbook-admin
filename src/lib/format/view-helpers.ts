import { normalizePublicImageUrl } from "./public-image-url";

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Epoch milliseconds of an API time (RFC 3339 in contract v3), or `null`
 * when it is absent or unreadable. */
export function parseApiTime(value: string | null | undefined): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function resolveJourneyListCoverUrl(source: {
  thumbnailUrl?: unknown;
  coverUrl?: unknown;
  metadata?: unknown;
}): string | null {
  const metadata = asRecord(source.metadata);

  return (
    normalizePublicImageUrl(readText(source.thumbnailUrl)) ??
    normalizePublicImageUrl(readText(source.coverUrl)) ??
    normalizePublicImageUrl(readText(metadata?.thumbnailUri)) ??
    null
  );
}
