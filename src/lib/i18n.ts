// The languages an article can be written in (ADR 0006), and how a
// language tag maps onto one.

export const languages = {
  en: {
    name: "English",
    nativeName: "English",
    locale: "en-US",
  },
  ko: {
    name: "Korean",
    nativeName: "한국어",
    locale: "ko-KR",
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    locale: "ja-JP",
  },
  zh: {
    name: "Chinese",
    nativeName: "中文",
    locale: "zh-CN",
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    locale: "es-ES",
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português (Brasil)",
    locale: "pt-BR",
  },
  fr: {
    name: "French",
    nativeName: "Français",
    locale: "fr-FR",
  },
  th: {
    name: "Thai",
    nativeName: "ไทย",
    locale: "th-TH",
  },
  vi: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    locale: "vi-VN",
  },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = "en";

export const languageList: Language[] = Object.keys(languages) as Language[];
type LanguageConfig = (typeof languages)[Language];

const localeToLanguage = new Map<string, Language>(
  languageList.map((lang) => [languages[lang].locale.toLowerCase(), lang]),
);

// Check if a language code is valid
function isValidLanguage(lang: string): lang is Language {
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
  if (typeof lang === "string" && isValidLanguage(lang)) {
    return languages[lang];
  }

  return languages[defaultLanguage];
}

export function toLocaleTag(lang: Language | string): string {
  return getLanguageConfig(lang).locale;
}
