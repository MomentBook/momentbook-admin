import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminReportDetail } from "@/lib/admin/reports";
import {
  loadWorkspacePage,
  readQueryParam,
} from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
} from "@/lib/admin/paths";
import { resolveReportBanner } from "../report-banner";
import { AdminReportDetailPageView } from "./AdminReportDetailPageView";

export const metadata: Metadata = {
  title: "Report Detail",
  robots: buildNoIndexRobots(),
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const reportId = decodeURIComponent(resolvedParams.reportId);
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const error = readQueryParam(resolvedSearchParams.error);
  const message = readQueryParam(resolvedSearchParams.message);

  const returnTo = buildAdminReportDetailHref(reportId);

  const banner = resolveReportBanner({
    error,
    message,
    mutation,
    status: readQueryParam(resolvedSearchParams.status),
    userStatus: readQueryParam(resolvedSearchParams.userStatus),
  });

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: (accessToken) => loadAdminReportDetail({ accessToken, reportId }),
    });
  } catch (err) {
    if (isBackendApiError(err)) {
      if (err.statusCode === 404) {
        redirect(
          buildAdminReportsHref({
            error: "report_not_found",
          }),
        );
      }

      return (
        <AdminWorkspaceErrorPage
          heading="The report details are temporarily unavailable."
          message={err.message}
          statusCode={err.statusCode}
        />
      );
    }

    throw err;
  }

  if (!result.data) {
    redirect(
      buildAdminReportsHref({
        error: "report_not_found",
      }),
    );
  }

  return (
    <WorkspaceShell active="reports" counts={result.counts} session={result.session}>
      <AdminReportDetailPageView
        banner={banner}
        report={result.data}
        returnTo={returnTo}
      />
    </WorkspaceShell>
  );
}
