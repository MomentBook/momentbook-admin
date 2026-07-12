import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  loadAdminReviewWorkspaceData,
} from "@/lib/admin/reviews";
import { loadAdminEditorialArticle } from "@/lib/editorial/admin";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  readQueryParam,
  withAdminWorkspaceSession,
} from "@/app/_workspace/workspace-data";
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
  const { data, session } = await withAdminWorkspaceSession({
    returnTo: nextPath,
    load: async (accessToken) => {
      const [reviews, article] = await Promise.all([
        loadAdminReviewWorkspaceData({
          accessToken,
          page: 1,
          status: "pending",
          limit: ADMIN_REVIEW_PAGE_SIZE,
        }),
        loadAdminEditorialArticle({
          accessToken,
          articleId,
        }),
      ]);

      return {
        article,
        queue: reviews.queue,
      };
    },
  });
  const article = data.article;

  if (!article) {
    redirect(
      withAdminQuery(returnTo, {
        error: "article_not_found",
      }),
    );
  }

  return (
    <EditorialArticleEditorPageView
      article={article}
      banner={banner}
      deleteAction={deleteEditorialArticleAction}
      nextPath={nextPath}
      queue={data.queue}
      returnTo={returnTo}
      saveAction={updateEditorialArticleAction}
      session={session}
      title="Edit article"
    />
  );
}
