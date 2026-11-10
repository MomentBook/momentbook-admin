import "server-only";

import {
  type EditorialArticleCategory,
  toArticleCategoryApiValue,
} from "@/lib/editorial/types";
import type {
  AdminArticleDetailDto,
  AdminArticleMutationDataDto,
  AdminArticlePageDto,
  AdminArticlesDataDto,
  AdminDeleteArticleDataDto,
  CreateAdminArticleRequestDto,
  UpdateAdminArticleRequestDto,
} from "@/src/apis/types";
import { requestApi, withPageCounts } from "./client";

// ─── Inputs ──────────────────────────────────
// Callers pass the editorial category spelling (`travel-guide`); the API
// takes the v3 enum (`TRAVEL_GUIDE`), mapped here (ADR 0012 item 5).

export type AdminArticleCreateInput = Omit<CreateAdminArticleRequestDto, "category"> & {
  category: EditorialArticleCategory;
};

export type AdminArticleUpdateInput = Omit<UpdateAdminArticleRequestDto, "category"> & {
  category?: EditorialArticleCategory;
};

// ─── List Articles ──────────────────────────

export async function listAdminArticles(input: {
  accessToken: string;
  page: number;
  limit: number;
  /** Only articles in this language (v3 renamed the `lang` filter). */
  language?: string;
  category?: EditorialArticleCategory;
}): Promise<AdminArticlesDataDto> {
  const page = await requestApi<AdminArticlePageDto>({
    pathname: "/core/admin/articles",
    accessToken: input.accessToken,
    query: {
      page: input.page,
      limit: input.limit,
      ...(input.language ? { language: input.language } : {}),
      ...(input.category ? { category: toArticleCategoryApiValue(input.category) } : {}),
    },
  });

  return withPageCounts(page);
}

// ─── Get Article ────────────────────────────

export async function getAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminArticleDetailDto> {
  return requestApi<AdminArticleDetailDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    accessToken: input.accessToken,
  });
}

// ─── Create Article ─────────────────────────

export async function createAdminArticle(input: {
  accessToken: string;
  article: AdminArticleCreateInput;
}): Promise<AdminArticleMutationDataDto> {
  const body: CreateAdminArticleRequestDto = {
    ...input.article,
    category: toArticleCategoryApiValue(input.article.category),
  };

  return requestApi<AdminArticleMutationDataDto>({
    pathname: "/core/admin/articles",
    method: "POST",
    accessToken: input.accessToken,
    body,
  });
}

// ─── Update Article ─────────────────────────

export async function updateAdminArticle(input: {
  accessToken: string;
  articleId: string;
  article: AdminArticleUpdateInput;
}): Promise<AdminArticleMutationDataDto> {
  const { category, ...fields } = input.article;
  const body: UpdateAdminArticleRequestDto = category
    ? { ...fields, category: toArticleCategoryApiValue(category) }
    : fields;

  return requestApi<AdminArticleMutationDataDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    method: "PATCH",
    accessToken: input.accessToken,
    body,
  });
}

// ─── Delete Article ─────────────────────────

export async function deleteAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminDeleteArticleDataDto> {
  return requestApi<AdminDeleteArticleDataDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    method: "DELETE",
    accessToken: input.accessToken,
  });
}
