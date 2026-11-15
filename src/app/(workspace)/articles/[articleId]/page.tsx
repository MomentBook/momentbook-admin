import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/navigation/paths";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminEditorialArticle } from "@/features/articles/loader";
import {
  loadWorkspacePage,
  readQueryParam,
} from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { resolveArticleBanner } from "@/features/articles/flash";
import {
  deleteEditorialArticleAction,
  updateEditorialArticleAction,
} from "@/features/articles/actions";
import { EditorialArticleEditorPageView } from "@/features/articles/components/article-editor-view";

export const metadata: Metadata = {
  title: "Edit Article",
};

export default async function AdminArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { articleId } = await params;
  const resolvedSearchParams = await searchParams;
  const returnTo =
    sanitizeAdminPath(readQueryParam(resolvedSearchParams.returnTo)) ??
    buildAdminArticleWorkspaceHref();
  const nextPath = buildAdminArticleDetailHref(articleId, {
    returnTo: returnTo === buildAdminArticleWorkspaceHref() ? null : returnTo,
  });
  const banner = resolveArticleBanner({
    error: readQueryParam(resolvedSearchParams.error),
    message: readQueryParam(resolvedSearchParams.message),
    mutation: readQueryParam(resolvedSearchParams.mutation),
    articleSlug: readQueryParam(resolvedSearchParams.articleSlug),
  });
  let result;

  try {
    result = await loadWorkspacePage({
      returnTo: nextPath,
      load: (accessToken) => loadAdminEditorialArticle({ accessToken, articleId }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      // The API answers 404 for an unknown or already deleted article.
      if (error.statusCode === 404) {
        redirect(withAdminQuery(returnTo, { error: "article_not_found" }));
      }

      return (
        <WorkspaceError
          heading="The article editor is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }
  const article = result.data;

  if (!article) {
    redirect(
      withAdminQuery(returnTo, {
        error: "article_not_found",
      }),
    );
  }

  return (
    <WorkspaceShell active="articles" counts={result.counts} session={result.session}>
      <EditorialArticleEditorPageView
        article={article}
        banner={banner}
        deleteAction={deleteEditorialArticleAction}
        nextPath={nextPath}
        returnTo={returnTo}
        saveAction={updateEditorialArticleAction}
        title="Edit article"
      />
    </WorkspaceShell>
  );
}
