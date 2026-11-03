import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminMetricsData, loadAdminNotificationMetricsData } from "@/lib/admin/metrics";
import { parseMetricsDays } from "@/lib/admin/metrics-shared";
import { buildAdminMetricsHref } from "@/lib/admin/paths";
import { loadWorkspacePage, readQueryParam } from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { AdminMetricsPageView } from "./AdminMetricsPageView";

export const metadata: Metadata = {
  title: "Metrics",
  robots: buildNoIndexRobots(),
};

export default async function AdminMetricsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const days = parseMetricsDays(readQueryParam(resolvedSearchParams.days));
  const returnTo = buildAdminMetricsHref({ days });

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo,
      load: async (accessToken) => {
        const [metrics, notifications] = await Promise.all([
          loadAdminMetricsData(accessToken, days),
          loadAdminNotificationMetricsData(accessToken, days),
        ]);
        return { metrics, notifications };
      },
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="Metrics are temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="metrics" counts={page.counts} session={page.session}>
      <AdminMetricsPageView
        data={page.data.metrics}
        notifications={page.data.notifications}
        days={days}
      />
    </WorkspaceShell>
  );
}
