import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadAuditLogParams } from "@/lib/navigation/audit-routes";
import { buildAdminAuditLogHref } from "@/lib/navigation/paths";
import { parseAuditActionFilter, parseAuditTargetTypeFilter } from "@/entities/audit-event/model";
import { AuditLogView, type AuditFilters } from "@/features/audit-log/components/audit-log-view";
import { loadAdminAuditLogData } from "@/features/audit-log/loader";

export const metadata: Metadata = {
  title: "Audit log",
};

/** The API caps `targetId` at 200 characters. */
const MAX_TARGET_ID_LENGTH = 200;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadAuditLogParams(await searchParams);
  const filters: AuditFilters = {
    action: parseAuditActionFilter(query.action),
    actorId: query.actorId ?? undefined,
    subjectUserId: query.subjectUserId ?? undefined,
    targetType: parseAuditTargetTypeFilter(query.targetType),
    targetId: query.targetId?.trim().slice(0, MAX_TARGET_ID_LENGTH) || undefined,
  };
  const returnTo = buildAdminAuditLogHref({ ...filters, page: query.page });

  return renderWorkspacePage({
    active: "audit",
    errorHeading: "The audit log is temporarily unavailable.",
    returnTo,
    load: (accessToken) => loadAdminAuditLogData(accessToken, { ...filters, page: query.page }),
    render: (data) => <AuditLogView data={data} filters={filters} />,
  });
}
