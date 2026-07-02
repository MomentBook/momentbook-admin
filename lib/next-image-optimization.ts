import { DEFAULT_PUBLIC_IMAGE_ORIGINS } from "@/lib/public-image-url";

const LOCAL_IMAGE_HOSTS = new Set(["localhost", "127.0.0.1"]);
const OPTIMIZED_MOMENTBOOK_ROOT = "momentbook.app";

function readUrlHostname(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function buildConfiguredOptimizableHosts(): Set<string> {
  return new Set(
    [
      process.env.NEXT_PUBLIC_ADMIN_SITE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN,
    ]
      .map((value) => readUrlHostname(value))
      .filter((value): value is string => Boolean(value)),
  );
}

const DEFAULT_PUBLIC_IMAGE_HOSTS = new Set(
  DEFAULT_PUBLIC_IMAGE_ORIGINS.map((origin) => readUrlHostname(origin)).filter(
    (value): value is string => Boolean(value),
  ),
);

export function normalizeNextImageSrc(src?: string | null): string | null {
  if (typeof src !== "string") {
    return null;
  }

  const trimmed = src.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function shouldBypassNextImageOptimization(
  src?: string | null,
): boolean {
  const safeSrc = normalizeNextImageSrc(src);

  if (!safeSrc || safeSrc.startsWith("/")) {
    return false;
  }

  try {
    const parsed = new URL(safeSrc);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true;
    }

    const hostname = parsed.hostname.toLowerCase();
    const configuredHosts = buildConfiguredOptimizableHosts();

    return !(
      LOCAL_IMAGE_HOSTS.has(hostname) ||
      hostname === OPTIMIZED_MOMENTBOOK_ROOT ||
      hostname.endsWith(`.${OPTIMIZED_MOMENTBOOK_ROOT}`) ||
      DEFAULT_PUBLIC_IMAGE_HOSTS.has(hostname) ||
      configuredHosts.has(hostname)
    );
  } catch {
    return true;
  }
}
