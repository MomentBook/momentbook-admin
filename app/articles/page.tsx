import type { Metadata } from "next";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/admin/api";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  loadAdminReviewWorkspaceData,
} from "@/lib/admin/reviews";
import {
  ADMIN_ARTICLE_PAGE_SIZE,
  loadAdminEditorialArticleDashboard,
  parseAdminArticleFilterCategory,
  parseAdminArticleFilterLanguage,
} from "@/lib/editorial/admin";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  parsePage,
  readQueryParam,
  withAdminWorkspaceSession,
} from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveArticleBanner } from "./article-banner";
import { AdminArticleListPageView } from "./AdminArticleListPageView";

export const metadata: Metadata = {
  title: "Articles",
  robots: buildNoIndexRobots(),
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parsePage(readQueryParam(resolvedSearchParams.page));
  const language = parseAdminArticleFilterLanguage(
    readQueryParam(resolvedSearchParams.lang),
  );
  const category = parseAdminArticleFilterCategory(
    readQueryParam(resolvedSearchParams.category),
  );
  const returnTo = buildAdminArticleWorkspaceHref({
    page,
    lang: language,
    category,
  });
  const banner = resolveArticleBanner({
    error: readQueryParam(resolvedSearchParams.error),
    message: readQueryParam(resolvedSearchParams.message),
    mutation: readQueryParam(resolvedSearchParams.mutation),
    articleSlug: readQueryParam(resolvedSearchParams.articleSlug),
  });

  let data, session;

  try {
    const result = await withAdminWorkspaceSession({
      returnTo,
      load: async (accessToken) => {
        const [dashboard, queue] = await Promise.all([
          loadAdminEditorialArticleDashboard({
            accessToken,
            page,
            limit: ADMIN_ARTICLE_PAGE_SIZE,
            language,
            category,
          }),
          loadAdminReviewWorkspaceData({
            accessToken,
            page: 1,
            status: "pending",
            limit: ADMIN_REVIEW_PAGE_SIZE,
          }),
        ]);

        return {
          dashboard,
          queue,
        };
      },
    });
    data = result.data;
    session = result.session;
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="The articles workspace is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <AdminArticleListPageView
      banner={banner}
      dashboard={data.dashboard}
      pendingReviews={data.queue.queue.summary.pendingCount}
      session={session}
    />
  );
}
