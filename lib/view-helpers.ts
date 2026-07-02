import { normalizePublicImageUrl } from "@/lib/public-image-url";

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

export function readCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }

  return null;
}

export function resolveMaxCount(...values: unknown[]): number {
  let maxCount = 0;

  for (const value of values) {
    const count = readCount(value);
    if (count !== null && count > maxCount) {
      maxCount = count;
    }
  }

  return maxCount;
}

export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template,
  );
}
