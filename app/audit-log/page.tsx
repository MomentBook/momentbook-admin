import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminAuditLogData } from "@/lib/admin/audit-log";
import { parseAuditActionFilter, parseAuditTargetTypeFilter } from "@/lib/admin/audit-log-shared";
import { parseUuidFilter } from "@/lib/admin/reports-shared";
import { buildAdminAuditLogHref } from "@/lib/admin/paths";
import { loadWorkspacePage, parsePage, readQueryParam } from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { AdminAuditLogPageView } from "./AdminAuditLogPageView";

export const metadata: Metadata = {
  title: "Audit log",
  robots: buildNoIndexRobots(),
};

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const read = (key: string) => readQueryParam(resolvedSearchParams[key]);
  const filters = {
    action: parseAuditActionFilter(read("action")),
    actorId: parseUuidFilter(read("actorId")),
    subjectUserId: parseUuidFilter(read("subjectUserId")),
    targetType: parseAuditTargetTypeFilter(read("targetType")),
    targetId: read("targetId")?.trim().slice(0, 200) || undefined,
  };
  const pageNumber = parsePage(read("page"));
  const returnTo = buildAdminAuditLogHref({ ...filters, page: pageNumber });

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminAuditLogData(accessToken, { ...filters, page: pageNumber }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="The audit log is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="audit" counts={page.counts} session={page.session}>
      <AdminAuditLogPageView data={page.data} filters={filters} />
    </WorkspaceShell>
  );
}
