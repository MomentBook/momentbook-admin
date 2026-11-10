import type { Language } from "@/lib/i18n/config";
import type { ArticleCategory } from "@/src/apis/types";

export const editorialArticleCategories = [
  "festival",
  "travel-guide",
  "destination-guide",
  "wellbeing-guide",
] as const;

export type EditorialArticleCategory =
  (typeof editorialArticleCategories)[number];

/** The API spells categories in UPPER_SNAKE_CASE (contract-v3 §2.7); admin
 * URLs and forms keep the editorial spelling (ADR 0012 item 5). */
const articleCategoryApiValues = {
  festival: "FESTIVAL",
  "travel-guide": "TRAVEL_GUIDE",
  "destination-guide": "DESTINATION_GUIDE",
  "wellbeing-guide": "WELLBEING_GUIDE",
} as const satisfies Record<EditorialArticleCategory, ArticleCategory>;

export function toArticleCategoryApiValue(
  category: EditorialArticleCategory,
): ArticleCategory {
  return articleCategoryApiValues[category];
}

/** The editorial category of an API value, or `null` for an unknown one. */
export function parseArticleCategoryApiValue(
  value: unknown,
): EditorialArticleCategory | null {
  return (
    editorialArticleCategories.find(
      (category) => articleCategoryApiValues[category] === value,
    ) ?? null
  );
}

export function parseEditorialArticleCategory(
  value: string | null | undefined,
): EditorialArticleCategory | null {
  const normalized = value?.trim();

  if (
    normalized &&
    editorialArticleCategories.includes(normalized as EditorialArticleCategory)
  ) {
    return normalized as EditorialArticleCategory;
  }

  return null;
}

export type EditorialArticleCoverImage = {
  url: string;
  alt: string;
};

export type EditorialArticleAlternate = {
  language: Language;
  locale: string;
  slug: string;
  title: string;
};

export type EditorialArticleListItem = {
  id: string;
  translationGroupId: string | null;
  language: Language;
  locale: string;
  category: EditorialArticleCategory;
  slug: string;
  title: string;
  summary: string;
  coverImage: EditorialArticleCoverImage | null;
  readingMinutes: number;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
};

export type EditorialArticleRecord = {
  id: string;
  translationGroupId: string;
  language: Language;
  locale: string;
  category: EditorialArticleCategory;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImage: EditorialArticleCoverImage | null;
  readingMinutes: number;
  authorName: string;
  alternates: EditorialArticleAlternate[];
  publishedAt: string;
  updatedAt: string;
};
