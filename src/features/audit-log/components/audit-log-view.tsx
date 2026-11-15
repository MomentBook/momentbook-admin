import Link from "next/link";
import { FilterChips } from "@/components/filter-chips";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import { formatCount } from "@/lib/format/number";
import { buildAdminAuditLogHref, buildAdminUserHref } from "@/lib/navigation/paths";
import {
  ADMIN_AUDIT_ACTION_LABELS,
  ADMIN_AUDIT_TARGET_TYPE_LABELS,
  AUDIT_ACTIONS,
  resolveAuditTargetHref,
  summarizeAuditDetails,
} from "@/entities/audit-event/model";
import type { AdminAuditLogFilters, AdminAuditLogWorkspaceData } from "@/features/audit-log/loader";
import { AuditActionSelect } from "./audit-action-select";
import { AuditLogTable, type AuditRow } from "./audit-log-table";

export type AuditFilters = Omit<AdminAuditLogFilters, "page">;

/** The log with these filters, at `page` (1 when left out). */
function hrefFor(filters: AuditFilters, page?: number): string {
  return buildAdminAuditLogHref({ ...filters, page });
}

function userHref(id: string | null | undefined): string | null {
  return id ? buildAdminUserHref(id) : null;
}

/** The filters that come from links (an admin, a user, a target), each
 * with a way to drop it; the action has its own select. */
function linkedFilterChips(filters: AuditFilters) {
  const without = (key: keyof AuditFilters) => hrefFor({ ...filters, [key]: undefined });

  return [
    filters.actorId ? { label: "Admin", value: filters.actorId, clearHref: without("actorId") } : null,
    filters.subjectUserId
      ? { label: "User", value: filters.subjectUserId, clearHref: without("subjectUserId") }
      : null,
    filters.targetType
      ? {
          label: `Target ${ADMIN_AUDIT_TARGET_TYPE_LABELS[filters.targetType]}`,
          clearHref: without("targetType"),
        }
      : null,
    filters.targetId
      ? { label: "Target id", value: filters.targetId, clearHref: without("targetId") }
      : null,
  ].filter((chip) => chip !== null);
}

export function AuditLogView({
  data,
  filters,
}: {
  data: AdminAuditLogWorkspaceData;
  filters: AuditFilters;
}) {
  const filtered = Object.values(filters).some(Boolean);
  const rows: AuditRow[] = data.actions.map((item) => ({
    ...item,
    targetHref: resolveAuditTargetHref(item),
    actorHref: userHref(item.actor?.id),
    subjectHref: userHref(item.subject?.id ?? item.subjectUserId),
    detailsText: summarizeAuditDetails(item.details),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          {formatCount(data.total)} {data.total === 1 ? "action" : "actions"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AuditActionSelect
          value={filters.action}
          allHref={hrefFor({ ...filters, action: undefined })}
          options={AUDIT_ACTIONS.map((action) => ({
            value: action,
            label: ADMIN_AUDIT_ACTION_LABELS[action],
            href: hrefFor({ ...filters, action }),
          }))}
        />
        <FilterChips
          chips={linkedFilterChips(filters)}
          clearAllHref={filtered ? hrefFor({}) : undefined}
        />
      </div>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <AuditLogTable rows={rows} />
          </div>
          <UrlPagination
            page={data.page}
            pages={data.pages}
            hrefFor={(page) => hrefFor(filters, page)}
          />
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{filtered ? "No actions match these filters." : "No admin actions yet."}</EmptyTitle>
          </EmptyHeader>
          {filtered || data.page > 1 ? (
            <EmptyContent className="flex-row justify-center">
              {filtered ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={hrefFor({})}>Clear filters</Link>
                </Button>
              ) : null}
              {data.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={hrefFor(filters)}>Go to page 1</Link>
                </Button>
              ) : null}
            </EmptyContent>
          ) : null}
        </Empty>
      )}
    </div>
  );
}
