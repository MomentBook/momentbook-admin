import type { Metadata } from "next";
import {
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
} from "@/lib/navigation/paths";
import { isBackendApiError } from "@/lib/api/client";
import { resolveSupportedLanguage } from "@/lib/i18n";
import { loadWorkspacePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/components/layout/workspace-error";
import { resolveArticleBanner } from "@/features/articles/flash";
import { createEditorialArticleAction } from "@/features/articles/actions";
import { EditorialArticleEditorPageView } from "@/features/articles/components/article-editor-view";

export const metadata: Metadata = {
  title: "Create Article",
};

export default async function AdminNewArticlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const returnTo =
    sanitizeAdminPath(readQueryParam(resolvedSearchParams.returnTo)) ??
    buildAdminArticleWorkspaceHref();
  const suggestedTranslationGroupId = readQueryParam(
    resolvedSearchParams.translationGroupId,
  );
  const suggestedLanguage = resolveSupportedLanguage(
    readQueryParam(resolvedSearchParams.language),
  );
  const nextPath = buildAdminArticleNewHref({
    returnTo: returnTo === buildAdminArticleWorkspaceHref() ? null : returnTo,
    translationGroupId: suggestedTranslationGroupId,
    language: suggestedLanguage,
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
      load: async () => null,
    });
  } catch (error) {
    if (isBackendApiError(error)) {
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

  return (
    <WorkspaceShell active="articles" counts={result.counts} session={result.session}>
      <EditorialArticleEditorPageView
        article={null}
        banner={banner}
        nextPath={nextPath}
        returnTo={returnTo}
        saveAction={createEditorialArticleAction}
        suggestedLanguage={suggestedLanguage}
        suggestedTranslationGroupId={suggestedTranslationGroupId}
        title="Create article"
      />
    </WorkspaceShell>
  );
}
