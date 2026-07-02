import type { Language } from "@/lib/i18n/config";

export const editorialArticleCategories = [
  "festival",
  "travel-guide",
  "destination-guide",
  "wellbeing-guide",
] as const;

export type EditorialArticleCategory =
  (typeof editorialArticleCategories)[number];

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
