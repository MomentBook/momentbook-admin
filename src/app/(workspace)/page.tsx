import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadOverviewParams, type OverviewParams } from "@/lib/navigation/overview-routes";
import {
  ADMIN_ROOT_PATH,
  buildAdminArticleWorkspaceHref,
  parseAdminWorkspaceTab,
} from "@/lib/navigation/paths";
import { buildAdminReportsHref } from "@/lib/navigation/report-routes";
import { buildAdminReviewQueueHref } from "@/lib/navigation/review-routes";
import { parseAdminReviewStatus } from "@/entities/journey/model";
import { AttentionOverview } from "@/features/overview/components/attention-overview";
import { loadAdminOverview } from "@/features/overview/loader";
import { resolveReviewBanner } from "@/features/reviews/flash";

export const metadata: Metadata = {
  title: "Attention",
};

/** Bookmarks from when every workspace screen lived at `/?tab=…`. */
function redirectLegacyTab(query: OverviewParams): void {
  const tab = parseAdminWorkspaceTab(query.tab);

  if (tab === "reviews") {
    redirect(
      buildAdminReviewQueueHref({
        status: query.status,
        page: query.page,
        entries: {
          targetPublicId: query.targetPublicId,
          mutation: query.mutation,
          reviewStatus: query.reviewStatus,
          error: query.error,
        },
      }),
    );
  }

  if (tab === "reports") {
    redirect(
      buildAdminReportsHref({
        page: query.page,
        status: query.status,
        targetType: query.targetType,
        reason: query.reason,
        mutation: query.mutation,
        error: query.error,
        message: query.message,
      }),
    );
  }

  if (tab === "articles") {
    redirect(
      buildAdminArticleWorkspaceHref({
        page: query.page,
        lang: query.lang,
        category: query.category,
        articleSlug: query.articleSlug,
        mutation: query.mutation,
        error: query.error,
        message: query.message,
      }),
    );
  }
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadOverviewParams(await searchParams);
  redirectLegacyTab(query);

  const banner = resolveReviewBanner({
    error: query.error,
    mutation: query.mutation,
    reviewStatus: parseAdminReviewStatus(query.reviewStatus),
    targetPublicId: query.targetPublicId,
  });

  return renderWorkspacePage({
    active: "attention",
    returnTo: ADMIN_ROOT_PATH,
    load: (accessToken) => loadAdminOverview({ accessToken }),
    render: (overview, counts) => (
      <AttentionOverview banner={banner} counts={counts} overview={overview} />
    ),
  });
}
