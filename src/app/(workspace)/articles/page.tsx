import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadArticlesParams } from "@/lib/navigation/article-routes";
import { buildAdminArticleWorkspaceHref } from "@/lib/navigation/paths";
import { ADMIN_PAGE_SIZE } from "@/lib/workspace/list-page";
import { normalizeEditorialLanguage } from "@/entities/article/records";
import { parseEditorialArticleCategory } from "@/entities/article/types";
import { ArticlesListView } from "@/features/articles/components/articles-list-view";
import { resolveArticleBanner } from "@/features/articles/flash";
import { loadAdminEditorialArticleDashboard } from "@/features/articles/loader";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadArticlesParams(await searchParams);
  const language = normalizeEditorialLanguage(query.lang);
  const category = parseEditorialArticleCategory(query.category);
  const returnTo = buildAdminArticleWorkspaceHref({ page: query.page, lang: language, category });

  return renderWorkspacePage({
    active: "articles",
    errorHeading: "The articles workspace is temporarily unavailable.",
    returnTo,
    load: (accessToken) =>
      loadAdminEditorialArticleDashboard({
        accessToken,
        page: query.page,
        limit: ADMIN_PAGE_SIZE,
        language,
        category,
      }),
    render: (data) => <ArticlesListView banner={resolveArticleBanner(query)} data={data} />,
  });
}
