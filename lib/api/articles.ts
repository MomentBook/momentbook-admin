import "server-only";

import type {
  AdminArticleDetailDto,
  AdminArticleMutationDataDto,
  AdminArticlesDataDto,
  AdminDeleteArticleDataDto,
  CreateAdminArticleRequestDto,
  UpdateAdminArticleRequestDto,
} from "@/src/apis/types";
import { requestEnvelope } from "./client";

// ─── Request DTO type alias ──────────────────

export type AdminArticleCategory = CreateAdminArticleRequestDto["category"];

// ─── List Articles ──────────────────────────

export async function listAdminArticles(input: {
  accessToken: string;
  page: number;
  limit: number;
  lang?: string;
  category?: AdminArticleCategory;
}): Promise<AdminArticlesDataDto> {
  const response = await requestEnvelope<AdminArticlesDataDto>({
    pathname: "/core/admin/articles",
    accessToken: input.accessToken,
    query: {
      page: input.page,
      limit: input.limit,
      ...(input.lang ? { lang: input.lang } : {}),
      ...(input.category ? { category: input.category } : {}),
    },
  });

  return response.data;
}

// ─── Get Article ────────────────────────────

export async function getAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminArticleDetailDto> {
  const response = await requestEnvelope<AdminArticleDetailDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    accessToken: input.accessToken,
  });

  return response.data;
}

// ─── Create Article ─────────────────────────

export async function createAdminArticle(input: {
  accessToken: string;
  article: CreateAdminArticleRequestDto;
}): Promise<AdminArticleMutationDataDto> {
  const response = await requestEnvelope<AdminArticleMutationDataDto>({
    pathname: "/core/admin/articles",
    method: "POST",
    accessToken: input.accessToken,
    body: input.article,
  });

  return response.data;
}

// ─── Update Article ─────────────────────────

export async function updateAdminArticle(input: {
  accessToken: string;
  articleId: string;
  article: UpdateAdminArticleRequestDto;
}): Promise<AdminArticleMutationDataDto> {
  const response = await requestEnvelope<AdminArticleMutationDataDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: input.article,
  });

  return response.data;
}

// ─── Delete Article ─────────────────────────

export async function deleteAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminDeleteArticleDataDto> {
  const response = await requestEnvelope<AdminDeleteArticleDataDto>({
    pathname: `/core/admin/articles/${encodeURIComponent(input.articleId)}`,
    method: "DELETE",
    accessToken: input.accessToken,
  });

  return response.data;
}
