import type { Metadata } from "next";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/api/client";
import {
  ADMIN_ARTICLE_PAGE_SIZE,
  loadAdminEditorialArticleDashboard,
  parseAdminArticleFilterCategory,
  parseAdminArticleFilterLanguage,
} from "@/lib/editorial/admin";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  loadWorkspacePage,
  parsePage,
  readQueryParam,
} from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
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

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminEditorialArticleDashboard({
          accessToken,
          page,
          limit: ADMIN_ARTICLE_PAGE_SIZE,
          language,
          category,
        }),
    });
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
    <WorkspaceShell active="articles" counts={result.counts} session={result.session}>
      <AdminArticleListPageView banner={banner} dashboard={result.data} />
    </WorkspaceShell>
  );
}
