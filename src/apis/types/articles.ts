// ──────────────────────────────────────────────
// Article API types — hand-written from NestJS contract
// Do NOT edit by hand if regenerating from backend; instead, update this file directly.
// ──────────────────────────────────────────────

// ─── Enums / Literal Unions ───────────────────

export type ArticleLanguage = "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
export type ArticleCategory = "festival" | "travel-guide" | "destination-guide" | "wellbeing-guide";

// ─── Cover ───────────────────────────────────

export interface ArticleCoverImageDto {
  url: string;
  alt: string;
}

// ─── Alternate ───────────────────────────────

export interface ArticleAlternateDto {
  language: string;
  locale: string;
  slug: string;
  title: string;
}

// ─── Public Article List Item ────────────────

export interface PublicArticleListItemDto {
  articleId: string;
  language: ArticleLanguage;
  locale: string;
  category: ArticleCategory;
  slug: string;
  title: string;
  summary: string;
  coverImage?: ArticleCoverImageDto;
  readingTimeMinutes: number;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
}

// ─── Public Article List Response ────────────

export interface PublicArticlesDataDto {
  articles: PublicArticleListItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface PublicArticlesResponseDto {
  status: string;
  data: PublicArticlesDataDto;
}

// ─── Public Article Detail ───────────────────

export interface PublicArticleDetailDto {
  articleId: string;
  translationGroupId: string;
  language: ArticleLanguage;
  locale: string;
  category: ArticleCategory;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImage?: ArticleCoverImageDto;
  readingTimeMinutes: number;
  authorName: string;
  alternates: ArticleAlternateDto[];
  publishedAt: string;
  updatedAt: string;
}

export interface PublicArticleDetailResponseDto {
  status: string;
  data: PublicArticleDetailDto;
}

// ─── Admin Article List Item ─────────────────

export interface AdminArticleListItemDto extends PublicArticleListItemDto {
  translationGroupId: string;
}

// ─── Admin Article List Response ─────────────

export interface AdminArticlesDataDto {
  articles: AdminArticleListItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminArticlesResponseDto {
  status: string;
  data: AdminArticlesDataDto;
}

// ─── Admin Article Detail ────────────────────

// Admin detail currently carries no extra fields over the public contract.
export type AdminArticleDetailDto = PublicArticleDetailDto;

// ─── Admin Article Mutation Response ─────────

export interface AdminArticleMutationDataDto {
  articleId: string;
  translationGroupId: string;
  language: ArticleLanguage;
  category: ArticleCategory;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}

export interface AdminArticleMutationResponseDto {
  status: string;
  data: AdminArticleMutationDataDto;
}

export interface AdminDeleteArticleDataDto {
  articleId: string;
  deleted: boolean;
}

export interface AdminDeleteArticleResponseDto {
  status: string;
  data: AdminDeleteArticleDataDto;
}

// ─── Admin Article Create/Update Request ─────

export interface CreateAdminArticleRequestDto {
  translationGroupId?: string;
  language: ArticleLanguage;
  slug?: string;
  category: ArticleCategory;
  title: string;
  body: string;
}

export interface UpdateAdminArticleRequestDto {
  category?: ArticleCategory;
  title?: string;
  body?: string;
}
