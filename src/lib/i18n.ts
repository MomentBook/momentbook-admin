// Language configuration for MomentBook web

export const languages = {
  en: {
    name: "English",
    nativeName: "English",
    locale: "en-US",
    openGraphLocale: "en_US",
    store: { ios: "us", hl: "en", gl: "US" },
  },
  ko: {
    name: "Korean",
    nativeName: "한국어",
    locale: "ko-KR",
    openGraphLocale: "ko_KR",
    store: { ios: "kr", hl: "ko", gl: "KR" },
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    locale: "ja-JP",
    openGraphLocale: "ja_JP",
    store: { ios: "jp", hl: "ja", gl: "JP" },
  },
  zh: {
    name: "Chinese",
    nativeName: "中文",
    locale: "zh-CN",
    openGraphLocale: "zh_CN",
    store: { ios: "cn", hl: "zh", gl: "CN" },
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    locale: "es-ES",
    openGraphLocale: "es_ES",
    store: { ios: "es", hl: "es", gl: "ES" },
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português (Brasil)",
    locale: "pt-BR",
    openGraphLocale: "pt_BR",
    store: { ios: "br", hl: "pt-BR", gl: "BR" },
  },
  fr: {
    name: "French",
    nativeName: "Français",
    locale: "fr-FR",
    openGraphLocale: "fr_FR",
    store: { ios: "fr", hl: "fr", gl: "FR" },
  },
  th: {
    name: "Thai",
    nativeName: "ไทย",
    locale: "th-TH",
    openGraphLocale: "th_TH",
    store: { ios: "th", hl: "th", gl: "TH" },
  },
  vi: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    locale: "vi-VN",
    openGraphLocale: "vi_VN",
    store: { ios: "vn", hl: "vi", gl: "VN" },
  },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = "en";

export const languageList: Language[] = Object.keys(languages) as Language[];
type LanguageConfig = (typeof languages)[Language];

const languagePrefixRegex = new RegExp(
  `^/(${languageList.map((code) => code.replace("-", "\\-")).join("|")})(?=/|$)`,
);
const localeToLanguage = new Map<string, Language>(
  languageList.map((lang) => [languages[lang].locale.toLowerCase(), lang]),
);

// Check if a language code is valid
export function isValidLanguage(lang: string): lang is Language {
  return lang in languages;
}

function canonicalizeLanguageTag(value: string): string | null {
  const normalized = value.trim().replaceAll("_", "-");
  if (!normalized) {
    return null;
  }

  try {
    return Intl.getCanonicalLocales(normalized)[0]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function resolveSupportedLanguage(
  value: string | null | undefined,
): Language | null {
  if (!value) {
    return null;
  }

  const canonical = canonicalizeLanguageTag(value);
  if (!canonical || canonical === "*") {
    return null;
  }

  let candidate = canonical;
  while (candidate) {
    const localeMatch = localeToLanguage.get(candidate);
    if (localeMatch) {
      return localeMatch;
    }

    if (isValidLanguage(candidate)) {
      return candidate;
    }

    const separatorIndex = candidate.lastIndexOf("-");
    if (separatorIndex < 0) {
      return null;
    }

    candidate = candidate.slice(0, separatorIndex);
  }

  return null;
}

function getLanguageConfig(lang: Language | string): LanguageConfig {
  // Route params and metadata can still receive invalid runtime strings while
  // Next.js resolves localized 404 paths, so avoid throwing on config lookups.
  if (typeof lang === "string" && isValidLanguage(lang)) {
    return languages[lang];
  }

  return languages[defaultLanguage];
}

export function toLocaleTag(lang: Language | string): string {
  return getLanguageConfig(lang).locale;
}

export function toOpenGraphLocale(lang: Language | string): string {
  return getLanguageConfig(lang).openGraphLocale;
}

export function getStoreRegion(lang: Language | string) {
  return getLanguageConfig(lang).store;
}

export function toHreflang(lang: Language | string): string {
  return toLocaleTag(lang);
}

export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(languagePrefixRegex, "");
}

export function getPathLanguage(path: string): Language | null {
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isValidLanguage(firstSegment)) {
    return firstSegment;
  }

  return null;
}

// Get language from path or return default
export function getLanguageFromPath(path: string): Language {
  return getPathLanguage(path) ?? defaultLanguage;
}

// Generate alternate language links for SEO
export function generateAlternateLinks(pathname: string) {
  const pathWithoutLang = stripLanguagePrefix(pathname);

  return languageList.map((lang) => ({
    lang: toHreflang(lang),
    url: `/${lang}${pathWithoutLang}`,
  }));
}

/**
 * Builds sitemap hreflang alternates for all supported languages.
 *
 * SEO Best Practices:
 * - Includes all 9 language variants with proper hreflang codes
 * - Uses `/` as x-default for the localized home surface
 * - Uses the default localized URL as x-default for deeper routes
 * - Returns absolute URLs required by sitemap.xml format
 *
 * @param siteUrl - Full site URL (e.g., "https://momentbook.app")
 * @param path - Page path without language prefix (e.g., "/about" or "")
 * @returns Array of hreflang alternate objects for sitemap.xml
 */
export function buildSitemapAlternates(siteUrl: string, path: string) {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return [
    ...languageList.map((lang) => ({
      lang: toHreflang(lang),
      href: `${siteUrl}/${lang}${normalizedPath}`,
    })),
    // x-default: Home points to the language gateway (`/`),
    // while deeper routes fall back to the default localized URL.
    {
      lang: "x-default",
      href:
        normalizedPath === ""
          ? `${siteUrl}/`
          : `${siteUrl}/${defaultLanguage}${normalizedPath}`,
      },
  ];
}

export function buildExplicitSitemapAlternates(
  siteUrl: string,
  current: {
    language: Language;
    path: string;
  },
  alternates: Array<{
    language: Language;
    path: string;
  }>,
) {
  const normalizePath = (value: string) =>
    value ? (value.startsWith("/") ? value : `/${value}`) : "";

  const paths = new Map<Language, string>();
  paths.set(current.language, normalizePath(current.path));

  for (const alternate of alternates) {
    paths.set(alternate.language, normalizePath(alternate.path));
  }

  const entries = [...paths.entries()].map(([language, path]) => ({
    lang: toHreflang(language),
    href: `${siteUrl}/${language}${path}`,
  }));

  entries.push({
    lang: "x-default",
    href: paths.has(defaultLanguage)
      ? `${siteUrl}/${defaultLanguage}${paths.get(defaultLanguage)}`
      : `${siteUrl}/${current.language}${normalizePath(current.path)}`,
  });

  return entries;
}

type ParsedLanguagePreference = {
  order: number;
  quality: number;
  value: string;
};

function parseLanguageQuality(raw: string | undefined): number {
  if (!raw) {
    return 1;
  }

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(parsed, 1);
}

export function parseAcceptLanguageHeader(
  acceptLanguageHeader: string | null,
): string[] {
  if (!acceptLanguageHeader) {
    return [];
  }

  const parsed = acceptLanguageHeader
    .split(",")
    .map<ParsedLanguagePreference | null>((part, order) => {
      const [rangePart, ...paramParts] = part.split(";");
      const value = rangePart?.trim();

      if (!value) {
        return null;
      }

      const qualityParameter = paramParts.find((param) =>
        param.trim().toLowerCase().startsWith("q="),
      );
      const quality = parseLanguageQuality(
        qualityParameter?.split("=")[1]?.trim(),
      );

      if (quality <= 0) {
        return null;
      }

      return {
        order,
        quality,
        value,
      };
    })
    .filter((entry): entry is ParsedLanguagePreference => entry !== null);

  parsed.sort((left, right) => {
    if (right.quality !== left.quality) {
      return right.quality - left.quality;
    }

    return left.order - right.order;
  });

  return parsed.map((entry) => entry.value);
}

export function detectLanguageFromLanguageList(
  candidates: readonly string[],
): Language | null {
  for (const candidate of candidates) {
    if (candidate.trim() === "*") {
      return defaultLanguage;
    }

    const resolved = resolveSupportedLanguage(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function detectLanguageFromAcceptLanguage(
  acceptLanguageHeader: string | null,
): Language {
  return (
    detectLanguageFromLanguageList(
      parseAcceptLanguageHeader(acceptLanguageHeader),
    ) ?? defaultLanguage
  );
}
