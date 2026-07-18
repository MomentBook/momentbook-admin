import { type Language, languageList } from "@/lib/i18n/config";
import type { ArticleAlternateDto } from "@/src/apis/core/client";
import { normalizeCoverImage, readPositiveInteger, readText } from "./normalize";
import {
  editorialArticleCategories,
  type EditorialArticleAlternate,
  type EditorialArticleCategory,
  type EditorialArticleListItem,
  type EditorialArticleRecord,
} from "./types";

const DEFAULT_AUTHOR_NAME = "MomentBook Editorial";
const DEFAULT_CATEGORY: EditorialArticleCategory = "travel-guide";
const GUIDE_SUMMARY_NOISE_PHRASE =
  /더\s*매끄럽고\s*더\s*풍부한\s*여행을\s*위한\s*핵심\s*여행\s*팁\s*좋은\s*여행은/gu;

function normalizeGuideSummary(summary: string): string {
  return summary
    .replace(GUIDE_SUMMARY_NOISE_PHRASE, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

type EditorialArticleListFields = {
  articleId: unknown;
  translationGroupId?: unknown;
  language: unknown;
  locale: unknown;
  category: unknown;
  slug: unknown;
  title: unknown;
  summary: unknown;
  coverImage?: unknown;
  readingTimeMinutes?: unknown;
  authorName?: unknown;
  publishedAt?: unknown;
  updatedAt?: unknown;
};

type EditorialArticleRecordFields = EditorialArticleListFields & {
  body: unknown;
  alternates?: ArticleAlternateDto[] | null;
};

export function normalizeEditorialLanguage(value: unknown): Language | null {
  const text = readText(value);

  if (!text || !languageList.includes(text as Language)) {
    return null;
  }

  return text as Language;
}

export function normalizeEditorialCategory(
  value: unknown,
): EditorialArticleCategory {
  const text = readText(value);

  if (text && editorialArticleCategories.includes(text as EditorialArticleCategory)) {
    return text as EditorialArticleCategory;
  }

  return DEFAULT_CATEGORY;
}

function normalizeEditorialReadingMinutes(value: unknown): number {
  return readPositiveInteger(value) ?? 1;
}

export function normalizeEditorialAlternates(
  alternates: ArticleAlternateDto[] | null | undefined,
): EditorialArticleAlternate[] {
  if (!Array.isArray(alternates)) {
    return [];
  }

  const seen = new Set<string>();

  return alternates
    .map((alternate) => {
      const language = normalizeEditorialLanguage(alternate.language);
      const locale = readText(alternate.locale);
      const slug = readText(alternate.slug);
      const title = readText(alternate.title);

      if (!language || !locale || !slug || !title) {
        return null;
      }

      const key = `${language}:${slug}`;
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);
      return {
        language,
        locale,
        slug,
        title,
      } satisfies EditorialArticleAlternate;
    })
    .filter((alternate): alternate is EditorialArticleAlternate => Boolean(alternate));
}

export function normalizeEditorialArticleListItem(
  item: EditorialArticleListFields,
): EditorialArticleListItem | null {
  const id = readText(item.articleId);
  const language = normalizeEditorialLanguage(item.language);
  const locale = readText(item.locale);
  const slug = readText(item.slug);
  const title = readText(item.title);
  const summary = readText(item.summary);
  const authorName = readText(item.authorName) ?? DEFAULT_AUTHOR_NAME;
  const updatedAt = readText(item.updatedAt);
  const publishedAt = readText(item.publishedAt) ?? updatedAt;

  if (!id || !language || !locale || !slug || !title || !summary || !updatedAt || !publishedAt) {
    return null;
  }

  return {
    id,
    translationGroupId: readText(item.translationGroupId),
    language,
    locale,
    category: normalizeEditorialCategory(item.category),
    slug,
    title,
    summary: normalizeGuideSummary(summary),
    coverImage: normalizeCoverImage(item.coverImage),
    readingMinutes: normalizeEditorialReadingMinutes(item.readingTimeMinutes),
    authorName,
    publishedAt,
    updatedAt,
  };
}

export function normalizeEditorialArticleRecord(
  item: EditorialArticleRecordFields,
): EditorialArticleRecord | null {
  const listItem = normalizeEditorialArticleListItem(item);
  const translationGroupId = readText(item.translationGroupId);
  const body = typeof item.body === "string" ? item.body.trim() : "";

  if (!listItem || !translationGroupId || !body) {
    return null;
  }

  return {
    ...listItem,
    translationGroupId,
    body,
    alternates: normalizeEditorialAlternates(item.alternates),
  };
}
