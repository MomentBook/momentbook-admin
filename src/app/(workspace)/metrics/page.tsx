import type { Metadata } from "next";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminMetricsData, loadAdminNotificationMetricsData } from "@/features/metrics/loader";
import { parseMetricsDays } from "@/features/metrics/model";
import { buildAdminMetricsHref } from "@/lib/navigation/paths";
import { loadWorkspacePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { AdminMetricsPageView } from "@/features/metrics/components/metrics-view";

export const metadata: Metadata = {
  title: "Metrics",
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
        <WorkspaceError
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
