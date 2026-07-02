import { normalizePublicImageUrl } from "@/lib/public-image-url";

export type PublishedImageVariantSource = {
  url?: unknown;
  fullUrl?: unknown;
  displayUrl?: unknown;
  thumbnailUrl?: unknown;
  imageUrl?: unknown;
  src?: unknown;
};

export type NormalizedPublishedImageVariantUrls = {
  url: string;
  fullUrl: string;
  displayUrl: string;
  thumbnailUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizePublishedImageUrl(value: unknown): string | null {
  return normalizePublicImageUrl(readText(value));
}

export function normalizePublishedImageVariantUrls(
  value: unknown,
): NormalizedPublishedImageVariantUrls | null {
  if (typeof value === "string") {
    const fullUrl = normalizePublishedImageUrl(value);

    if (!fullUrl) {
      return null;
    }

    return {
      url: fullUrl,
      fullUrl,
      displayUrl: fullUrl,
      thumbnailUrl: fullUrl,
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  const legacyUrl =
    normalizePublishedImageUrl(value.url) ??
    normalizePublishedImageUrl(value.imageUrl) ??
    normalizePublishedImageUrl(value.src);
  const fullUrl =
    normalizePublishedImageUrl(value.fullUrl) ??
    legacyUrl;

  if (!fullUrl) {
    return null;
  }

  const displayUrl =
    normalizePublishedImageUrl(value.displayUrl) ??
    fullUrl;
  const thumbnailUrl =
    normalizePublishedImageUrl(value.thumbnailUrl) ??
    displayUrl;

  return {
    url: fullUrl,
    fullUrl,
    displayUrl,
    thumbnailUrl,
  };
}

export function resolvePublishedImageFullUrl(
  image: PublishedImageVariantSource,
): string {
  return (
    normalizePublishedImageUrl(image.fullUrl) ??
    normalizePublishedImageUrl(image.url) ??
    ""
  );
}

export function resolvePublishedImageDisplayUrl(
  image: PublishedImageVariantSource,
): string {
  return (
    normalizePublishedImageUrl(image.displayUrl) ??
    resolvePublishedImageFullUrl(image)
  );
}

export function resolvePublishedImageThumbnailUrl(
  image: PublishedImageVariantSource,
): string {
  return (
    normalizePublishedImageUrl(image.thumbnailUrl) ??
    resolvePublishedImageDisplayUrl(image)
  );
}

export function publishedImageMatchesUrl(
  image: PublishedImageVariantSource,
  url: string | null | undefined,
): boolean {
  const normalizedUrl = normalizePublishedImageUrl(url);

  if (!normalizedUrl) {
    return false;
  }

  return [
    image.thumbnailUrl,
    image.displayUrl,
    image.fullUrl,
    image.url,
  ].some((candidate) => normalizePublishedImageUrl(candidate) === normalizedUrl);
}
