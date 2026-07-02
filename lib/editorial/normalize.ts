import type { EditorialArticleCoverImage } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readPositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}

export function normalizeCoverImage(
  value: unknown,
): EditorialArticleCoverImage | null {
  if (!isRecord(value)) {
    return null;
  }

  const url = readText(value.url);
  const alt = readText(value.alt);

  if (!url || !alt) {
    return null;
  }

  return {
    url,
    alt,
  };
}
