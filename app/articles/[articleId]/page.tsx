import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminEditorialArticle } from "@/lib/editorial/admin";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  loadWorkspacePage,
  readQueryParam,
} from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveArticleBanner } from "../article-banner";
import {
  deleteEditorialArticleAction,
  updateEditorialArticleAction,
} from "../actions";
import { EditorialArticleEditorPageView } from "../EditorialArticleEditorPageView";

export const metadata: Metadata = {
  title: "Edit Article",
  robots: buildNoIndexRobots(),
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
        <AdminWorkspaceErrorPage
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
