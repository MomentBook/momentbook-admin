import type { Metadata } from "next";
import {
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { isBackendApiError } from "@/lib/admin/api";
import { resolveSupportedLanguage } from "@/lib/i18n/config";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { loadAdminWorkspaceShell, readQueryParam } from "@/app/_workspace/workspace-data";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveArticleBanner } from "../article-banner";
import { createEditorialArticleAction } from "../actions";
import { EditorialArticleEditorPageView } from "../EditorialArticleEditorPageView";

export const metadata: Metadata = {
  title: "Create Article",
  robots: buildNoIndexRobots(),
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
  let queue, session;

  try {
    const result = await loadAdminWorkspaceShell({
      page: 1,
      returnTo: nextPath,
      status: "pending",
    });
    queue = result.queue;
    session = result.session;
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
    <EditorialArticleEditorPageView
      article={null}
      banner={banner}
      nextPath={nextPath}
      queue={queue}
      returnTo={returnTo}
      saveAction={createEditorialArticleAction}
      session={session}
      suggestedLanguage={suggestedLanguage}
      suggestedTranslationGroupId={suggestedTranslationGroupId}
      title="Create article"
    />
  );
}
