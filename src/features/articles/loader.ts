import "server-only";

import { getAdminArticle, listAdminArticles } from "@/lib/api/articles";
import { isBackendApiError } from "@/lib/api/client";
import { type Language } from "@/lib/i18n";
import {
  type EditorialArticleCategory,
  type EditorialArticleListItem,
  type EditorialArticleRecord,
} from "@/entities/article/types";
import {
  normalizeEditorialArticleListItem,
  normalizeEditorialArticleRecord,
} from "@/entities/article/records";

export type AdminEditorialArticleDashboardData = {
  items: EditorialArticleListItem[];
  page: number;
  pages: number;
  total: number;
  language: Language | null;
  category: EditorialArticleCategory | null;
};

export async function loadAdminEditorialArticle(options: {
  accessToken: string;
  articleId: string;
}): Promise<EditorialArticleRecord | null> {
  const detail = await getAdminArticle({
    accessToken: options.accessToken,
    articleId: options.articleId,
  });

  return normalizeEditorialArticleRecord(detail);
}

/** The article the editor opens; `null` when there is no such article (the
 * API answers 404 for an unknown or deleted one) or its record is unusable. */
export async function loadArticleForEditor(
  accessToken: string,
  articleId: string,
): Promise<EditorialArticleRecord | null> {
  try {
    return await loadAdminEditorialArticle({ accessToken, articleId });
  } catch (error) {
    if (isBackendApiError(error) && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export async function loadAdminEditorialArticleDashboard(options: {
  accessToken: string;
  page: number;
  limit: number;
  language: Language | null;
  category: EditorialArticleCategory | null;
}): Promise<AdminEditorialArticleDashboardData> {
  const list = await listAdminArticles({
    accessToken: options.accessToken,
    page: options.page,
    limit: options.limit,
    ...(options.language ? { language: options.language } : {}),
    ...(options.category ? { category: options.category } : {}),
  });

  return {
    items: list.items
      .map((item) => normalizeEditorialArticleListItem(item))
      .filter((item): item is EditorialArticleListItem => Boolean(item)),
    page: list.page,
    pages: list.pages,
    total: list.total,
    language: options.language,
    category: options.category,
  };
}
