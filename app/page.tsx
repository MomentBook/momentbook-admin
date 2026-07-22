import type { Metadata } from "next";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminWorkspaceHref,
  parseAdminWorkspaceTab,
} from "@/lib/admin/paths";
import { redirect } from "next/navigation";
import { BackendApiError } from "@/lib/admin/api";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { AdminWorkspace } from "@/app/_workspace/AdminWorkspace";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import {
  loadAdminWorkspaceShell,
  parsePage,
  parseReviewStatus,
  parseStatus,
  readQueryParam,
  resolveBanner,
} from "@/app/_workspace/workspace-data";

export const metadata: Metadata = {
  title: "Moderation Workspace",
  robots: buildNoIndexRobots(),
};

export default async function AdminIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab = parseAdminWorkspaceTab(
    readQueryParam(resolvedSearchParams.tab),
  );

  if (activeTab === "articles") {
    redirect(
      buildAdminArticleWorkspaceHref({
        page: readQueryParam(resolvedSearchParams.page),
        lang: readQueryParam(resolvedSearchParams.lang),
        category: readQueryParam(resolvedSearchParams.category),
        articleSlug: readQueryParam(resolvedSearchParams.articleSlug),
        mutation: readQueryParam(resolvedSearchParams.mutation),
        error: readQueryParam(resolvedSearchParams.error),
        message: readQueryParam(resolvedSearchParams.message),
      }),
    );
  }

  const page = parsePage(readQueryParam(resolvedSearchParams.page));
  const status = parseStatus(readQueryParam(resolvedSearchParams.status));
  const targetPublicId = readQueryParam(resolvedSearchParams.targetPublicId);
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const reviewStatus = parseReviewStatus(
    readQueryParam(resolvedSearchParams.reviewStatus),
  );
  const returnTo = buildAdminWorkspaceHref(activeTab, {
    page: page > 1 ? String(page) : null,
    status: status === "pending" ? null : status,
  });
  const banner = resolveBanner({
    error: readQueryParam(resolvedSearchParams.error),
    mutation,
    reviewStatus,
    targetPublicId,
  });

  let overview, queue, session;

  try {
    const result = await loadAdminWorkspaceShell({
      page,
      returnTo,
      status,
    });
    overview = result.overview;
    queue = result.queue;
    session = result.session;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return (
        <AdminWorkspaceErrorPage
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <AdminWorkspace
      activeTab={activeTab}
      banner={banner}
      overview={overview}
      queue={queue}
      session={session}
    />
  );
}
