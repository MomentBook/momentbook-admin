import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalizedDateTime } from "@/components/LocalizedTime";
import { buildAdminAuditLogHref, buildAdminUserHref, ADMIN_AUDIT_LOG_PATH } from "@/lib/admin/paths";
import type { AdminAuditLogWorkspaceData, AdminAuditLogFilters } from "@/lib/admin/audit-log";
import {
  ADMIN_AUDIT_ACTION_LABELS,
  ADMIN_AUDIT_TARGET_TYPE_LABELS,
  AUDIT_ACTIONS,
  resolveAuditTargetHref,
  summarizeAuditDetails,
} from "@/lib/admin/audit-log-shared";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminAuditUserDto } from "@/src/apis/types";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type Filters = Omit<AdminAuditLogFilters, "page">;

function hrefFor(filters: Filters, page?: number): string {
  return buildAdminAuditLogHref({ ...filters, page });
}

function ActionFilter({ filters }: { filters: Filters }) {
  // Other active filters ride along as hidden inputs so picking an action keeps them.
  const carried = [
    ["actorId", filters.actorId],
    ["subjectUserId", filters.subjectUserId],
    ["targetType", filters.targetType],
    ["targetId", filters.targetId],
  ] as const;

  return (
    <form method="get" action={ADMIN_AUDIT_LOG_PATH} className="flex flex-wrap items-center gap-2">
      <select
        name="action"
        aria-label="Action"
        defaultValue={filters.action ?? ""}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">All actions</option>
        {AUDIT_ACTIONS.map((action) => (
          <option key={action} value={action}>
            {ADMIN_AUDIT_ACTION_LABELS[action]}
          </option>
        ))}
      </select>
      {carried.map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <Button type="submit" variant="outline" size="sm">
        Apply
      </Button>
    </form>
  );
}

function Chips({ filters }: { filters: Filters }) {
  const chips = [
    filters.action
      ? { label: ADMIN_AUDIT_ACTION_LABELS[filters.action], clear: { ...filters, action: undefined } }
      : null,
    filters.actorId
      ? { label: `Admin ${filters.actorId}`, clear: { ...filters, actorId: undefined } }
      : null,
    filters.subjectUserId
      ? { label: `User ${filters.subjectUserId}`, clear: { ...filters, subjectUserId: undefined } }
      : null,
    filters.targetType
      ? {
          label: `Target ${ADMIN_AUDIT_TARGET_TYPE_LABELS[filters.targetType]}`,
          clear: { ...filters, targetType: undefined },
        }
      : null,
    filters.targetId
      ? { label: `Target id ${filters.targetId}`, clear: { ...filters, targetId: undefined } }
      : null,
  ].filter((chip) => chip !== null);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {chips.map((chip) => (
        <Badge key={chip.label} variant="secondary" className="gap-1 font-mono">
          {chip.label}
          <Link href={hrefFor(chip.clear)} aria-label={`Remove ${chip.label}`}>
            ×
          </Link>
        </Badge>
      ))}
      <Button asChild variant="outline" size="sm">
        <Link href={hrefFor({})}>Clear filters</Link>
      </Button>
    </div>
  );
}

function UserCell({ user, fallbackId }: { user: AdminAuditUserDto | null; fallbackId?: string | null }) {
  const id = user?.userId ?? fallbackId;

  if (!id) return <span className="text-muted-foreground">—</span>;

  return (
    <Link href={buildAdminUserHref(id)} className="font-medium text-primary hover:underline">
      {user?.name || user?.email || id}
    </Link>
  );
}

function Pagination({ data, filters }: { data: AdminAuditLogWorkspaceData; filters: Filters }) {
  if (data.pages <= 1) return null;

  const previous = data.page > 1 ? Math.min(data.page - 1, data.pages) : null;
  const next = data.page < data.pages ? data.page + 1 : null;

  return (
    <div className="flex items-center justify-between gap-2">
      {previous ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(filters, previous)}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-xs text-muted-foreground">
        Page {data.page} of {data.pages}
      </span>
      {next ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(filters, next)}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}

export function AdminAuditLogPageView({
  data,
  filters,
}: {
  data: AdminAuditLogWorkspaceData;
  filters: Filters;
}) {
  const filtered = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} {data.total === 1 ? "action" : "actions"}
        </p>
      </div>

      <ActionFilter filters={filters} />
      <Chips filters={filters} />

      {data.actions.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.actions.map((item) => {
                  const targetHref = resolveAuditTargetHref(item);
                  const details = summarizeAuditDetails(item.details);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <LocalizedDateTime
                          lang={ADMIN_DISPLAY_LANGUAGE}
                          timestamp={Date.parse(item.createdAt)}
                        />
                      </TableCell>
                      <TableCell>
                        <UserCell user={item.actor} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ADMIN_AUDIT_ACTION_LABELS[item.action]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">
                            {ADMIN_AUDIT_TARGET_TYPE_LABELS[item.targetType]}
                          </span>
                          {targetHref ? (
                            <Link
                              href={targetHref}
                              className="break-all font-mono text-xs text-primary hover:underline"
                            >
                              {item.targetId}
                            </Link>
                          ) : (
                            <span className="break-all font-mono text-xs">{item.targetId}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserCell user={item.subject} fallbackId={item.subjectUserId} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {item.reason ? (
                          <span className="whitespace-pre-wrap break-words">{item.reason}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {details ? (
                          <span className="break-all font-mono text-xs">{details}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Pagination data={data} filters={filters} />
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <p className="font-medium">
              {filtered ? "No actions match these filters." : "No admin actions yet."}
            </p>
            {filtered ? (
              <Button asChild variant="outline" size="sm">
                <Link href={hrefFor({})}>Clear filters</Link>
              </Button>
            ) : data.page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={hrefFor({})}>Go to page 1</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
