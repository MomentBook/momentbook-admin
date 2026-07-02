import {
  defaultLanguage,
  languageList,
  toHreflang,
  type Language,
} from "@/lib/i18n/config";

type ExplicitAlternate = {
  language: Language;
  path: string;
};

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function buildXDefaultPath(normalizedPath: string) {
  return normalizedPath === "" ? "/" : `/${defaultLanguage}${normalizedPath}`;
}

/**
 * Builds alternate language links for SEO (hreflang + canonical).
 *
 * Returns relative URLs that Next.js converts to absolute URLs using the
 * `metadataBase` set in `app/[lang]/layout.tsx`.
 *
 * SEO Strategy:
 * - Includes all 9 supported languages as hreflang alternates
 * - Uses `/` as x-default for the localized home surface and English for deeper routes
 * - Canonical points to the current language variant
 *
 * @param lang - Current page language
 * @param path - Page path without language prefix (e.g., "/about" or "")
 * @returns Object with canonical URL and language alternates
 *
 * @example
 * buildAlternates("ko", "/about")
 * // Returns:
 * // {
 * //   canonical: "/ko/about",
 * //   languages: {
 * //     "en-US": "/en/about",
 * //     "ko-KR": "/ko/about",
 * //     ...,
 * //     "x-default": "/en/about"
 * //   }
 * // }
 */
export function buildAlternates(lang: Language, path: string) {
  const normalizedPath = normalizePath(path);
  const languages = Object.fromEntries([
    ...languageList.map((code) => [
      toHreflang(code),
      `/${code}${normalizedPath}`,
    ]),
    // x-default: Home points to the generic language gateway (`/`),
    // while deeper routes fall back to English because no non-prefixed variant exists.
    ["x-default", buildXDefaultPath(normalizedPath)],
  ]) as Record<string, string>;

  return {
    canonical: `/${lang}${normalizedPath}`,
    languages,
  };
}

export function buildExplicitAlternates(
  lang: Language,
  path: string,
  alternates: ExplicitAlternate[],
) {
  const normalizedPath = normalizePath(path);
  const explicitPaths = new Map<Language, string>();

  explicitPaths.set(lang, normalizedPath);

  for (const alternate of alternates) {
    explicitPaths.set(alternate.language, normalizePath(alternate.path));
  }

  const languages = Object.fromEntries(
    [...explicitPaths.entries()].map(([language, alternatePath]) => [
      toHreflang(language),
      `/${language}${alternatePath}`,
    ]),
  ) as Record<string, string>;

  languages["x-default"] = explicitPaths.has(defaultLanguage)
    ? `/${defaultLanguage}${explicitPaths.get(defaultLanguage)}`
    : `/${lang}${normalizedPath}`;

  return {
    canonical: `/${lang}${normalizedPath}`,
    languages,
  };
}

export function buildPaginatedAlternates(
  lang: Language,
  path: string,
  page: number,
) {
  if (page <= 1) {
    return buildAlternates(lang, path);
  }

  const normalizedPath = normalizePath(path);
  const languages = Object.fromEntries([
    ...languageList.map((code) => [
      toHreflang(code),
      `/${code}${normalizedPath}?page=${page}`,
    ]),
    ["x-default", `${buildXDefaultPath(normalizedPath)}?page=${page}`],
  ]) as Record<string, string>;

  return {
    canonical: `/${lang}${normalizedPath}?page=${page}`,
    languages,
  };
}

/**
 * Builds OpenGraph URL for the current language variant.
 *
 * Returns a relative URL that Next.js converts to absolute using metadataBase.
 *
 * @param lang - Current page language
 * @param path - Page path without language prefix
 * @returns Relative URL for OpenGraph metadata
 */
export function buildOpenGraphUrl(lang: Language, path: string) {
  const normalizedPath = normalizePath(path);

  return `/${lang}${normalizedPath}`;
}

export function buildRootAlternates() {
  const languages = Object.fromEntries([
    ...languageList.map((code) => [toHreflang(code), `/${code}`]),
    ["x-default", "/"],
  ]) as Record<string, string>;

  return {
    canonical: "/",
    languages,
  };
}
