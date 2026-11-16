import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadArticleEditorParams } from "@/lib/navigation/article-routes";
import {
  buildAdminArticleDetailHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/navigation/paths";
import {
  deleteEditorialArticleAction,
  updateEditorialArticleAction,
} from "@/features/articles/actions";
import { ArticleEditorView } from "@/features/articles/components/article-editor-view";
import { resolveArticleBanner } from "@/features/articles/flash";
import { loadArticleForEditor } from "@/features/articles/loader";

export const metadata: Metadata = {
  title: "Edit Article",
};

export default async function ArticleEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { articleId } = await params;
  const query = loadArticleEditorParams(await searchParams);
  const listHref = buildAdminArticleWorkspaceHref();
  const returnTo = sanitizeAdminPath(query.returnTo) ?? listHref;
  const nextPath = buildAdminArticleDetailHref(articleId, {
    returnTo: returnTo === listHref ? null : returnTo,
  });

  return renderWorkspacePage({
    active: "articles",
    errorHeading: "The article editor is temporarily unavailable.",
    returnTo: nextPath,
    load: (accessToken) => loadArticleForEditor(accessToken, articleId),
    render: (article) => {
      if (!article) {
        redirect(withAdminQuery(returnTo, { error: "article_not_found" }));
      }

      return (
        <ArticleEditorView
          article={article}
          banner={resolveArticleBanner(query)}
          deleteAction={deleteEditorialArticleAction}
          nextPath={nextPath}
          returnTo={returnTo}
          saveAction={updateEditorialArticleAction}
        />
      );
    },
  });
}
