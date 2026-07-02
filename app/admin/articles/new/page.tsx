import type { Metadata } from "next";
import {
  buildAdminArticleNewHref,
  buildAdminArticleWorkspaceHref,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { resolveSupportedLanguage } from "@/lib/i18n/config";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { loadAdminWorkspaceShell, readQueryParam } from "../../workspace-data";
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
    revalidation: readQueryParam(resolvedSearchParams.revalidation),
    articleSlug: readQueryParam(resolvedSearchParams.articleSlug),
  });
  const { queue, session } = await loadAdminWorkspaceShell({
    page: 1,
    returnTo: nextPath,
    status: "pending",
  });

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
