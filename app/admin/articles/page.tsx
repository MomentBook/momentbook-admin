import type { Metadata } from "next";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
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
} from "../workspace-data";
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
    revalidation: readQueryParam(resolvedSearchParams.revalidation),
    articleSlug: readQueryParam(resolvedSearchParams.articleSlug),
  });

  const { data, session } = await withAdminWorkspaceSession({
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

  return (
    <AdminArticleListPageView
      banner={banner}
      dashboard={data.dashboard}
      pendingReviews={data.queue.queue.summary.pendingCount}
      session={session}
    />
  );
}
