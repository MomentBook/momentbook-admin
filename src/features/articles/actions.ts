"use server";

import { z } from "zod";
import { createAdminArticle, deleteAdminArticle, updateAdminArticle } from "@/lib/api/articles";
import {
  formText,
  readFormText,
  requiredText,
  runAdminAction,
  type ActionOutcome,
  type ApiRefusal,
  type QueryEntries,
} from "@/lib/actions/admin-action";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
} from "@/lib/navigation/paths";
import { loadAdminEditorialArticle } from "./loader";
import { articleCreateFields, articleEditFields } from "./schema";

// Each form carries two paths: `nextPath`, the editor it was sent from, where
// a failure returns, and `returnTo`, the list it was opened from, which a
// save keeps for the editor's back link and a delete returns to.

/** The keys an article action owns on the page it lands on, in the order
 * the URL lists them. */
const ARTICLE_BASE_QUERY: QueryEntries = {
  error: null,
  message: null,
  mutation: null,
  articleSlug: null,
};

/** A message as one short banner line. */
function bannerMessage(message: string): string | null {
  return message.replace(/\s+/g, " ").trim().slice(0, 220) || null;
}

/** A field that fails its check: the check's own sentence. */
function invalidArticle(error: z.ZodError): QueryEntries {
  return {
    error: "article_validation",
    message: bannerMessage(error.issues[0]?.message ?? ""),
  };
}

/** The API refusing the article (400, 409: a slug taken, a group that does
 * not exist) or not finding it (404), with its reason. */
function articleRefusal(error: ApiRefusal): ActionOutcome | undefined {
  if (error.statusCode === 400 || error.statusCode === 409) {
    return { query: { error: "article_validation", message: bannerMessage(error.message) } };
  }

  if (error.statusCode === 404) {
    return { query: { error: "article_not_found", message: bannerMessage(error.message) } };
  }

  return undefined;
}

/** The list a form names, or the default one. */
function listHref(returnTo: string): string {
  return sanitizeAdminPath(returnTo) ?? buildAdminArticleWorkspaceHref();
}

/** A saved article opens in the editor, keeping the list it came from
 * unless that is the default one. */
function savedOutcome(
  saved: { articleId: string; slug?: string | null },
  mutation: "article_created" | "article_updated",
  returnTo: string,
): ActionOutcome {
  const list = listHref(returnTo);

  return {
    path: buildAdminArticleDetailHref(saved.articleId),
    query: {
      mutation,
      articleSlug: saved.slug ?? null,
      returnTo: list === buildAdminArticleWorkspaceHref() ? null : list,
    },
  };
}

/** The editor of the form's article, before the form is read. */
function editorPath(formData: FormData): string {
  const articleId = readFormText(formData, "articleId");
  return articleId ? buildAdminArticleDetailHref(articleId) : buildAdminArticleWorkspaceHref();
}

const articleRunner = {
  returnField: "nextPath",
  baseQuery: () => ARTICLE_BASE_QUERY,
  onInvalid: invalidArticle,
  onApiError: articleRefusal,
  showApiMessage: false,
} as const;

export async function createEditorialArticleAction(formData: FormData): Promise<never> {
  return runAdminAction({
    ...articleRunner,
    formData,
    fallbackPath: buildAdminArticleNewHref(),
    fields: articleCreateFields.extend({ returnTo: formText }),
    failure: "article_create_failed",
    run: async ({ returnTo, slug, translationGroupId, ...article }, session) => {
      const created = await createAdminArticle({
        accessToken: session.accessToken,
        article: {
          ...article,
          ...(slug ? { slug } : {}),
          ...(translationGroupId ? { translationGroupId } : {}),
        },
      });

      return savedOutcome(created, "article_created", returnTo);
    },
  });
}

/** Saves category, title and body; language, slug and translation group
 * never change after creation, whatever the form sends. */
export async function updateEditorialArticleAction(formData: FormData): Promise<never> {
  return runAdminAction({
    ...articleRunner,
    formData,
    fallbackPath: editorPath(formData),
    fields: z.object({
      articleId: requiredText("articleId is required."),
      ...articleEditFields.shape,
      returnTo: formText,
    }),
    failure: "article_update_failed",
    run: async ({ articleId, returnTo, ...article }, session) => {
      const previous = await loadAdminEditorialArticle({
        accessToken: session.accessToken,
        articleId,
      });

      if (!previous) {
        return { path: buildAdminArticleWorkspaceHref(), query: { error: "article_not_found" } };
      }

      const updated = await updateAdminArticle({
        accessToken: session.accessToken,
        articleId,
        article,
      });

      return savedOutcome(updated, "article_updated", returnTo);
    },
  });
}

/** Deletes one language of an article and returns to the list, naming the
 * slug it had. */
export async function deleteEditorialArticleAction(formData: FormData): Promise<never> {
  return runAdminAction({
    ...articleRunner,
    formData,
    fallbackPath: editorPath(formData),
    fields: z.object({ articleId: requiredText("articleId is required."), returnTo: formText }),
    failure: "article_delete_failed",
    run: async ({ articleId, returnTo }, session) => {
      const previous = await loadAdminEditorialArticle({
        accessToken: session.accessToken,
        articleId,
      });

      await deleteAdminArticle({ accessToken: session.accessToken, articleId });

      return {
        path: listHref(returnTo),
        query: { mutation: "article_deleted", articleSlug: previous?.slug ?? null },
      };
    },
  });
}
