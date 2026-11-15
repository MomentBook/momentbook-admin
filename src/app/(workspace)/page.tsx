import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ADMIN_ROOT_PATH,
  buildAdminArticleWorkspaceHref,
  buildAdminReportsHref,
  buildAdminReviewQueueHref,
  parseAdminWorkspaceTab,
} from "@/lib/navigation/paths";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminOverview } from "@/features/overview/loader";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AttentionOverview } from "@/features/overview/components/attention-overview";
import { AdminWorkspaceErrorPage } from "@/components/layout/workspace-error";
import { parseAdminReviewStatus } from "@/features/reviews/loader";
import { loadWorkspacePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
import { resolveReviewBanner } from "@/features/reviews/flash";

export const metadata: Metadata = {
  title: "Attention",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Bookmarks from when every workspace screen lived at `/?tab=…`. */
function redirectLegacyTab(searchParams: SearchParams): void {
  const tab = parseAdminWorkspaceTab(readQueryParam(searchParams.tab));
  const read = (key: string) => readQueryParam(searchParams[key]);

  if (tab === "reviews") {
    redirect(
      buildAdminReviewQueueHref({
        status: read("status"),
        page: read("page"),
        entries: {
          targetPublicId: read("targetPublicId"),
          mutation: read("mutation"),
          reviewStatus: read("reviewStatus"),
          error: read("error"),
        },
      }),
    );
  }

  if (tab === "reports") {
    redirect(
      buildAdminReportsHref({
        page: read("page"),
        status: read("status"),
        targetType: read("targetType"),
        reason: read("reason"),
        mutation: read("mutation"),
        error: read("error"),
        message: read("message"),
      }),
    );
  }

  if (tab === "articles") {
    redirect(
      buildAdminArticleWorkspaceHref({
        page: read("page"),
        lang: read("lang"),
        category: read("category"),
        articleSlug: read("articleSlug"),
        mutation: read("mutation"),
        error: read("error"),
        message: read("message"),
      }),
    );
  }
}

export default async function AdminIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  redirectLegacyTab(resolvedSearchParams);

  const banner = resolveReviewBanner({
    error: readQueryParam(resolvedSearchParams.error),
    mutation: readQueryParam(resolvedSearchParams.mutation),
    reviewStatus: parseAdminReviewStatus(readQueryParam(resolvedSearchParams.reviewStatus)),
    targetPublicId: readQueryParam(resolvedSearchParams.targetPublicId),
  });

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo: ADMIN_ROOT_PATH,
      load: (accessToken) => loadAdminOverview({ accessToken }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return <AdminWorkspaceErrorPage message={error.message} statusCode={error.statusCode} />;
    }

    throw error;
  }

  return (
    <WorkspaceShell active="attention" counts={page.counts} session={page.session}>
      <AttentionOverview banner={banner} counts={page.counts} overview={page.data} />
    </WorkspaceShell>
  );
}
