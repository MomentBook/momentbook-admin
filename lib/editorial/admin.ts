import "server-only";

import { getAdminArticle, getAdminArticles } from "@/lib/admin/api";
import { type Language } from "@/lib/i18n/config";
import type {
  AdminArticleDetailDto,
  AdminArticleListItemDto,
} from "@/src/apis/client";
import {
  editorialArticleCategories,
  type EditorialArticleCategory,
  type EditorialArticleListItem,
  type EditorialArticleRecord,
} from "./types";
import {
  normalizeEditorialArticleListItem,
  normalizeEditorialArticleRecord,
  normalizeEditorialLanguage,
} from "./records";

export const ADMIN_ARTICLE_PAGE_SIZE = 20;

export type AdminEditorialArticleDashboardData = {
  items: EditorialArticleListItem[];
  page: number;
  pages: number;
  total: number;
  language: Language | null;
  category: EditorialArticleCategory | null;
};

function normalizeListItem(item: AdminArticleListItemDto): EditorialArticleListItem | null {
  return normalizeEditorialArticleListItem(item);
}

function normalizeRecord(item: AdminArticleDetailDto): EditorialArticleRecord | null {
  return normalizeEditorialArticleRecord(item);
}

export function parseAdminArticleFilterLanguage(value: string | null): Language | null {
  return normalizeEditorialLanguage(value);
}

export function parseAdminArticleFilterCategory(
  value: string | null,
): EditorialArticleCategory | null {
  if (!value) {
    return null;
  }

  return editorialArticleCategories.includes(value as EditorialArticleCategory)
    ? (value as EditorialArticleCategory)
    : null;
}

export async function loadAdminEditorialArticle(options: {
  accessToken: string;
  articleId: string;
}): Promise<EditorialArticleRecord | null> {
  const detail = await getAdminArticle({
    accessToken: options.accessToken,
    articleId: options.articleId,
  });

  return normalizeRecord(detail);
}

export async function loadAdminEditorialArticleDashboard(options: {
  accessToken: string;
  page: number;
  limit: number;
  language: Language | null;
  category: EditorialArticleCategory | null;
}): Promise<AdminEditorialArticleDashboardData> {
  const list = await getAdminArticles({
    accessToken: options.accessToken,
    page: options.page,
    limit: options.limit,
    ...(options.language ? { lang: options.language } : {}),
    ...(options.category ? { category: options.category } : {}),
  });

  return {
    items: (list.articles ?? [])
      .map((item) => normalizeListItem(item))
      .filter((item): item is EditorialArticleListItem => Boolean(item)),
    page: list.page,
    pages: list.pages,
    total: list.total,
    language: options.language,
    category: options.category,
  };
}
