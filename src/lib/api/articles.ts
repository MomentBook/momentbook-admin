import "server-only";

import type {
  AdminArticleDetailDto,
  AdminArticleMutationDataDto,
  AdminArticlesDataDto,
  AdminDeleteArticleDataDto,
  CreateAdminArticleRequestDto,
  UpdateAdminArticleRequestDto,
} from "@/lib/api/types";
import { type EditorialArticleCategory, toArticleCategoryApiValue } from "./article-category";
import { bearer, coreClient, dataOf, withPageCounts } from "./client";

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
  const page = await dataOf(
    coreClient.GET("/core/admin/articles", {
      params: {
        query: {
          page: input.page,
          limit: input.limit,
          language: input.language,
          category: input.category ? toArticleCategoryApiValue(input.category) : undefined,
        },
      },
      headers: bearer(input.accessToken),
    }),
  );

  return withPageCounts(page);
}

// ─── Get Article ────────────────────────────

export async function getAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminArticleDetailDto> {
  return dataOf(
    coreClient.GET("/core/admin/articles/{articleId}", {
      params: { path: { articleId: input.articleId } },
      headers: bearer(input.accessToken),
    }),
  );
}

// ─── Create Article ─────────────────────────

export async function createAdminArticle(input: {
  accessToken: string;
  article: AdminArticleCreateInput;
}): Promise<AdminArticleMutationDataDto> {
  return dataOf(
    coreClient.POST("/core/admin/articles", {
      headers: bearer(input.accessToken),
      body: {
        ...input.article,
        category: toArticleCategoryApiValue(input.article.category),
      },
    }),
  );
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

  return dataOf(
    coreClient.PATCH("/core/admin/articles/{articleId}", {
      params: { path: { articleId: input.articleId } },
      headers: bearer(input.accessToken),
      body,
    }),
  );
}

// ─── Delete Article ─────────────────────────

export async function deleteAdminArticle(input: {
  accessToken: string;
  articleId: string;
}): Promise<AdminDeleteArticleDataDto> {
  return dataOf(
    coreClient.DELETE("/core/admin/articles/{articleId}", {
      params: { path: { articleId: input.articleId } },
      headers: bearer(input.accessToken),
    }),
  );
}
