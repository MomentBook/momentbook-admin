import type { Metadata } from "next";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminAuditLogData } from "@/features/audit-log/loader";
import { parseAuditActionFilter, parseAuditTargetTypeFilter } from "@/entities/audit-event/model";
import { parseUuidFilter } from "@/lib/navigation/params";
import { buildAdminAuditLogHref } from "@/lib/navigation/paths";
import { loadWorkspacePage, parsePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { AdminAuditLogPageView } from "@/features/audit-log/components/audit-log-view";

export const metadata: Metadata = {
  title: "Audit log",
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
        <WorkspaceError
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
