import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { resolveSupportedLanguage } from "@/lib/i18n";
import { loadArticleEditorParams } from "@/lib/navigation/article-routes";
import {
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
} from "@/lib/navigation/paths";
import { createEditorialArticleAction } from "@/features/articles/actions";
import { ArticleEditorView } from "@/features/articles/components/article-editor-view";
import { resolveArticleBanner } from "@/features/articles/flash";

export const metadata: Metadata = {
  title: "Create Article",
};

export default async function ArticleCreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadArticleEditorParams(await searchParams);
  const listHref = buildAdminArticleWorkspaceHref();
  const returnTo = sanitizeAdminPath(query.returnTo) ?? listHref;
  const suggestedLanguage = resolveSupportedLanguage(query.language);
  const nextPath = buildAdminArticleNewHref({
    returnTo: returnTo === listHref ? null : returnTo,
    translationGroupId: query.translationGroupId,
    language: suggestedLanguage,
  });

  return renderWorkspacePage({
    active: "articles",
    errorHeading: "The article editor is temporarily unavailable.",
    returnTo: nextPath,
    // Nothing to load: the shell's counts and the session are enough.
    load: async () => null,
    render: () => (
      <ArticleEditorView
        article={null}
        banner={resolveArticleBanner(query)}
        nextPath={nextPath}
        returnTo={returnTo}
        saveAction={createEditorialArticleAction}
        suggestedLanguage={suggestedLanguage}
        suggestedTranslationGroupId={query.translationGroupId}
      />
    ),
  });
}
