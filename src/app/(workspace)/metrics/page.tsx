import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadMetricsParams } from "@/lib/navigation/metrics-routes";
import { buildAdminMetricsHref } from "@/lib/navigation/paths";
import { MetricsView } from "@/features/metrics/components/metrics-view";
import { loadMetricsPage } from "@/features/metrics/loader";
import { parseMetricsDays } from "@/features/metrics/model";

export const metadata: Metadata = {
  title: "Metrics",
};

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadMetricsParams(await searchParams);
  const days = parseMetricsDays(query.days);

  return renderWorkspacePage({
    active: "metrics",
    errorHeading: "Metrics are temporarily unavailable.",
    returnTo: buildAdminMetricsHref({ days }),
    load: (accessToken) => loadMetricsPage(accessToken, days),
    render: ({ metrics, notifications }) => (
      <MetricsView data={metrics} notifications={notifications} days={days} />
    ),
  });
}
