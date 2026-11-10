// ──────────────────────────────────────────────
// Article admin API types: aliases of the generated v3 DTOs (ADR 0012).
// ──────────────────────────────────────────────

import type {
  AdminArticleDeletionDto,
  AdminArticleDto,
  AdminArticleMutationResultDto,
  AdminArticlePageDto,
  AdminArticleSummaryDto,
  ArticleAlternateDto as GeneratedArticleAlternateDto,
  CreateAdminArticleRequestDto as GeneratedCreateAdminArticleRequestDto,
  UpdateAdminArticleRequestDto as GeneratedUpdateAdminArticleRequestDto,
} from "../generated/core";
import type { PageCounts } from "./shared";

// ─── Enums ────────────────────────────────────

export type ArticleLanguage = AdminArticleDto["language"];
/** UPPER_SNAKE_CASE on the wire; admin URLs and forms keep the editorial
 * spelling (`lib/editorial/types.ts`). */
export type ArticleCategory = AdminArticleDto["category"];

// ─── Articles ─────────────────────────────────

export type ArticleAlternateDto = GeneratedArticleAlternateDto;
export type AdminArticleListItemDto = AdminArticleSummaryDto;
export type { AdminArticlePageDto };
export type AdminArticlesDataDto = AdminArticlePageDto & PageCounts;
export type AdminArticleDetailDto = AdminArticleDto;

// ─── Mutations ────────────────────────────────

export type CreateAdminArticleRequestDto = GeneratedCreateAdminArticleRequestDto;
export type UpdateAdminArticleRequestDto = GeneratedUpdateAdminArticleRequestDto;
export type AdminArticleMutationDataDto = AdminArticleMutationResultDto;
export type AdminDeleteArticleDataDto = AdminArticleDeletionDto;
