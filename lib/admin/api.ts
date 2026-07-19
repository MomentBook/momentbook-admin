import "server-only";

import type {
  AdminArticleDetailDto,
  AdminArticleMutationDataDto,
  AdminArticlesDataDto,
  AdminDeleteArticleDataDto,
  AdminPublishedJourneysDataDto,
  CreateAdminArticleRequestDto,
  PublishedJourneyDetailDto,
  UpdateAdminArticleRequestDto,
  UpdatePublishedJourneyReviewDataDto,
  UpdatePublishedJourneyReviewRequestDto,
} from "@/src/apis/core/client";
import { ENV } from "@/src/configs/env.server";

type Envelope<T> = {
  status: string;
  data: T;
  message?: string;
};

type AdminArticleCategory = CreateAdminArticleRequestDto["category"];

type TokenRefreshResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AccessTokenClaims = {
  role?: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  exp?: number;
  [key: string]: unknown;
};

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export class AdminSessionExpiredError extends BackendApiError {
  constructor(message = "Admin session expired") {
    super(message, 401);
    this.name = "AdminSessionExpiredError";
  }
}

export class AdminAccessDeniedError extends BackendApiError {
  constructor(message = "Admin access required") {
    super(message, 403);
    this.name = "AdminAccessDeniedError";
  }
}

function buildApiUrl(pathname: string, query?: Record<string, string | number>) {
  const url = new URL(pathname, ENV.API_BASE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseEnvelope<T>(response: Response): Promise<Envelope<T>> {
  const payload = (await response.json().catch(() => null)) as
    | Envelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw new AdminSessionExpiredError(message);
    }

    if (response.status === 403) {
      throw new AdminAccessDeniedError(message);
    }

    throw new BackendApiError(message, response.status);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new BackendApiError("Invalid backend response shape", response.status);
  }

  return payload as Envelope<T>;
}

async function requestEnvelope<T>(options: {
  pathname: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  accessToken?: string;
  body?: unknown;
  query?: Record<string, string | number>;
}): Promise<Envelope<T>> {
  const response = await fetch(buildApiUrl(options.pathname, options.query), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
  });

  return parseEnvelope<T>(response);
}

export async function logoutAdminFromBackend(
  refreshToken: string,
): Promise<void> {
  await requestEnvelope<void>({
    pathname: "/auth/logout",
    method: "POST",
    body: { refreshToken },
  });
}

export async function refreshAdminTokens(
  refreshToken: string,
): Promise<TokenRefreshResponseData> {
  const response = await requestEnvelope<TokenRefreshResponseData>({
    pathname: "/auth/refresh",
    method: "POST",
    body: { refreshToken },
  });

  return response.data;
}

export async function getAdminPublishedJourneysPage(input: {
  accessToken: string;
  page: number;
  limit: number;
}): Promise<AdminPublishedJourneysDataDto> {
  const response = await requestEnvelope<AdminPublishedJourneysDataDto>({
    pathname: "/core/admin/journeys/publish",
    accessToken: input.accessToken,
    query: {
      page: input.page,
      limit: input.limit,
    },
  });

  return response.data;
}

export async function getAdminPublishedJourneyDetail(input: {
  accessToken: string;
  publicId: string;
  lang?: string;
}): Promise<PublishedJourneyDetailDto> {
  const response = await requestEnvelope<PublishedJourneyDetailDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}`,
    accessToken: input.accessToken,
    query: input.lang
      ? {
          lang: input.lang,
        }
      : undefined,
  });

  return response.data;
}

export async function updatePublishedJourneyReviewStatus(input: {
  accessToken: string;
  publicId: string;
  status: UpdatePublishedJourneyReviewRequestDto["status"];
}): Promise<UpdatePublishedJourneyReviewDataDto> {
  const response = await requestEnvelope<UpdatePublishedJourneyReviewDataDto>({
    pathname: `/core/admin/journeys/publish/${encodeURIComponent(input.publicId)}/review`,
    method: "PATCH",
    accessToken: input.accessToken,
    body: {
      status: input.status,
    },
  });

  return response.data;
}

export async function getAdminArticles(input: {
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

export function readTokenExpiryMs(token: string): number {
  return readAccessTokenClaims(token).exp! * 1000;
}

/**
 * Decodes (does NOT verify) JWT payload claims from a raw access token.
 * Tokens MUST originate from trusted backend API responses.
 */
export function readAccessTokenClaims(token: string): AccessTokenClaims {
  const segments = token.split(".");
  if (segments.length < 2) {
    throw new Error("Invalid token format");
  }

  const payloadSegment = segments[1];
  const normalized = payloadSegment
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");
  const payload = JSON.parse(
    Buffer.from(normalized, "base64").toString("utf8"),
  ) as AccessTokenClaims;

  if (typeof payload.exp !== "number") {
    throw new Error("Missing access token expiration");
  }

  return payload;
}
