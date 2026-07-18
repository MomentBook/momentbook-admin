"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  BackendApiError,
  createAdminArticle,
  deleteAdminArticle,
  updateAdminArticle,
} from "@/lib/admin/api";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import { requireAdminActionSession } from "@/lib/admin/session";
import { loadAdminEditorialArticle } from "@/lib/editorial/admin";
import {
  editorialArticleCategories,
  type EditorialArticleCategory,
} from "@/lib/editorial/types";
import { languageList, type Language } from "@/lib/i18n/config";
import type {
  CreateAdminArticleRequestDto,
  UpdateAdminArticleRequestDto,
} from "@/src/apis/core/client";

type ArticleActionErrorCode =
  | "article_validation"
  | "article_not_found"
  | "article_create_failed"
  | "article_update_failed"
  | "article_delete_failed";

type ArticleMutationKind = "create" | "update" | "delete";
type ArticleActionContext = {
  nextPath: string;
  returnTo: string;
  session: Awaited<ReturnType<typeof requireAdminActionSession>>;
};

class ArticleActionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArticleActionValidationError";
  }
}

const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(value: FormDataEntryValue | null): string | null {
  const text = readText(value);
  return text.length > 0 ? text : null;
}

function readRequiredValue(formData: FormData, key: string): string {
  const value = readText(formData.get(key));

  if (!value) {
    throw new ArticleActionValidationError(`${key} is required.`);
  }

  return value;
}

function sanitizeBannerMessage(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 220);
}

function resolveCurrentPath(formData: FormData, fallback: string): string {
  return sanitizeAdminPath(readText(formData.get("nextPath"))) ?? fallback;
}

function resolveReturnTo(formData: FormData): string {
  return (
    sanitizeAdminPath(readText(formData.get("returnTo"))) ??
    buildAdminArticleWorkspaceHref()
  );
}

function normalizeDetailReturnTo(returnTo: string): string | null {
  return returnTo === buildAdminArticleWorkspaceHref() ? null : returnTo;
}

function buildArticleFailureRedirect(options: {
  error: ArticleActionErrorCode;
  message?: string | null;
  nextPath: string;
}): never {
  redirect(
    withAdminQuery(options.nextPath, {
      error: options.error,
      message: options.message ? sanitizeBannerMessage(options.message) : null,
      mutation: null,
      articleSlug: null,
    }),
  );
}

function parseLanguage(value: string): Language {
  if (languageList.includes(value as Language)) {
    return value as Language;
  }

  throw new ArticleActionValidationError("language is invalid.");
}

function parseCategory(value: string): EditorialArticleCategory {
  if (editorialArticleCategories.includes(value as EditorialArticleCategory)) {
    return value as EditorialArticleCategory;
  }

  throw new ArticleActionValidationError("category is invalid.");
}

function readRequiredBody(formData: FormData): string {
  const body = formData.get("body");

  if (typeof body !== "string" || body.trim().length === 0) {
    throw new ArticleActionValidationError("body is required.");
  }

  return body.trim();
}

function validateMarkdownImageSyntax(body: string) {
  const imageStarts = body.match(/!\[/g)?.length ?? 0;
  const matches = [...body.matchAll(MARKDOWN_IMAGE_PATTERN)];

  if (matches.length !== imageStarts) {
    throw new ArticleActionValidationError(
      "Markdown images must use ![alt](https://...) syntax.",
    );
  }

  for (const match of matches) {
    const alt = match[1]?.trim();
    const url = match[2]?.trim();

    if (!alt) {
      throw new ArticleActionValidationError(
        "Markdown image alt text must not be empty.",
      );
    }

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new ArticleActionValidationError(
          "Markdown image URLs must use http or https.",
        );
      }
    } catch (error) {
      if (error instanceof ArticleActionValidationError) {
        throw error;
      }

      throw new ArticleActionValidationError(
        "Markdown image URLs must be absolute http or https URLs.",
      );
    }
  }
}

function buildCreatePayload(formData: FormData): CreateAdminArticleRequestDto {
  const language = parseLanguage(readRequiredValue(formData, "language"));
  const category = parseCategory(readRequiredValue(formData, "category"));
  const title = readRequiredValue(formData, "title");
  const body = readRequiredBody(formData);
  const slug = readOptionalText(formData.get("slug"));
  const translationGroupId = readOptionalText(formData.get("translationGroupId"));

  validateMarkdownImageSyntax(body);

  return {
    language,
    category,
    title,
    body,
    ...(slug ? { slug } : {}),
    ...(translationGroupId ? { translationGroupId } : {}),
  };
}

function buildUpdatePayload(formData: FormData): UpdateAdminArticleRequestDto {
  const category = parseCategory(readRequiredValue(formData, "category"));
  const title = readRequiredValue(formData, "title");
  const body = readRequiredBody(formData);

  validateMarkdownImageSyntax(body);

  return {
    category,
    title,
    body,
  };
}

function resolveArticleActionFailure(
  kind: ArticleMutationKind,
  error: unknown,
): {
  error: ArticleActionErrorCode;
  message: string | null;
} {
  if (error instanceof ArticleActionValidationError) {
    return {
      error: "article_validation",
      message: sanitizeBannerMessage(error.message),
    };
  }

  if (error instanceof BackendApiError) {
    if (error.statusCode === 400 || error.statusCode === 409) {
      return {
        error: "article_validation",
        message: sanitizeBannerMessage(error.message),
      };
    }

    if (error.statusCode === 404) {
      return {
        error: "article_not_found",
        message: sanitizeBannerMessage(error.message),
      };
    }
  }

  return {
    error:
      kind === "create"
        ? "article_create_failed"
        : kind === "delete"
          ? "article_delete_failed"
          : "article_update_failed",
    message: null,
  };
}

async function prepareArticleActionContext(
  formData: FormData,
  fallbackPath: string,
): Promise<ArticleActionContext> {
  const cookieStore = await cookies();
  const nextPath = resolveCurrentPath(formData, fallbackPath);

  return {
    nextPath,
    returnTo: resolveReturnTo(formData),
    session: await requireAdminActionSession(cookieStore, nextPath),
  };
}

function redirectToArticleDetail(options: {
  articleId: string;
  articleSlug: string | null | undefined;
  mutation: "article_created" | "article_updated";
  returnTo: string;
}): never {
  redirect(
    buildAdminArticleDetailHref(options.articleId, {
      mutation: options.mutation,
      articleSlug: options.articleSlug ?? null,
      returnTo: normalizeDetailReturnTo(options.returnTo),
    }),
  );
}

function redirectToArticleWorkspace(options: {
  articleSlug: string | null | undefined;
  returnTo: string;
}): never {
  redirect(
    withAdminQuery(options.returnTo, {
      mutation: "article_deleted",
      articleSlug: options.articleSlug ?? null,
      error: null,
      message: null,
    }),
  );
}

async function withArticleActionFailureRedirect(
  kind: ArticleMutationKind,
  nextPath: string,
  operation: () => Promise<never>,
): Promise<never> {
  try {
    return await operation();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return buildArticleFailureRedirect({
      ...resolveArticleActionFailure(kind, error),
      nextPath,
    });
  }
}

export async function createEditorialArticleAction(
  formData: FormData,
): Promise<never> {
  const context = await prepareArticleActionContext(
    formData,
    buildAdminArticleNewHref(),
  );

  return withArticleActionFailureRedirect("create", context.nextPath, async () => {
    const created = await createAdminArticle({
      accessToken: context.session.accessToken,
      article: buildCreatePayload(formData),
    });
    redirectToArticleDetail({
      articleId: created.articleId,
      articleSlug: created.slug,
      mutation: "article_created",
      returnTo: context.returnTo,
    });
  });
}

export async function updateEditorialArticleAction(
  formData: FormData,
): Promise<never> {
  const articleId = readRequiredValue(formData, "articleId");
  const context = await prepareArticleActionContext(
    formData,
    buildAdminArticleDetailHref(articleId),
  );

  return withArticleActionFailureRedirect("update", context.nextPath, async () => {
    const previousArticle = await loadAdminEditorialArticle({
      accessToken: context.session.accessToken,
      articleId,
    });
    if (!previousArticle) {
      return buildArticleFailureRedirect({
        error: "article_not_found",
        message: null,
        nextPath: buildAdminArticleWorkspaceHref(),
      });
    }

    const updated = await updateAdminArticle({
      accessToken: context.session.accessToken,
      articleId,
      article: buildUpdatePayload(formData),
    });
    redirectToArticleDetail({
      articleId: updated.articleId,
      articleSlug: updated.slug,
      mutation: "article_updated",
      returnTo: context.returnTo,
    });
  });
}

export async function deleteEditorialArticleAction(
  formData: FormData,
): Promise<never> {
  const articleId = readRequiredValue(formData, "articleId");
  const context = await prepareArticleActionContext(
    formData,
    buildAdminArticleDetailHref(articleId),
  );

  return withArticleActionFailureRedirect("delete", context.nextPath, async () => {
    const previousArticle = await loadAdminEditorialArticle({
      accessToken: context.session.accessToken,
      articleId,
    });
    await deleteAdminArticle({
      accessToken: context.session.accessToken,
      articleId,
    });

    redirectToArticleWorkspace({
      articleSlug: previousArticle?.slug,
      returnTo: context.returnTo,
    });
  });
}
