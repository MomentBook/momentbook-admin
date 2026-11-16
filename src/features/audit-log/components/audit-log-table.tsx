"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { Placeholder } from "@/components/detail-parts";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import type { AdminAuditLogItemDto, AdminAuditUserDto } from "@/lib/api/types";
import {
  ADMIN_AUDIT_ACTION_LABELS,
  ADMIN_AUDIT_TARGET_TYPE_LABELS,
} from "@/entities/audit-event/model";

/** An audit row with what the server worked out for it: the target's page
 * (`null` when it has none), the admin's and the subject's pages, and the
 * details as one line of text. */
export type AuditRow = AdminAuditLogItemDto & {
  targetHref: string | null;
  actorHref: string | null;
  subjectHref: string | null;
  detailsText: string | null;
};

const column = createColumnHelper<DataTableFeatures, AuditRow>();

function UserLink({
  user,
  href,
  fallbackId,
}: {
  user: AdminAuditUserDto | null;
  href: string | null;
  fallbackId?: string | null;
}) {
  const id = user?.id ?? fallbackId;

  if (!id || !href) return <Placeholder />;

  return (
    <Link href={href} className="font-medium text-primary hover:underline">
      {user?.name || user?.email || user?.providerEmail || id}
    </Link>
  );
}

const columns = column.columns([
  column.accessor("createdAt", {
    header: "Time",
    cell: ({ getValue }) => <Time value={getValue()} withTime />,
  }),
  column.accessor("actor", {
    header: "Admin",
    cell: ({ row }) => <UserLink user={row.original.actor} href={row.original.actorHref} />,
  }),
  column.accessor("action", {
    header: "Action",
    cell: ({ getValue }) => <Badge variant="outline">{ADMIN_AUDIT_ACTION_LABELS[getValue()]}</Badge>,
  }),
  column.accessor("targetId", {
    header: "Target",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          {ADMIN_AUDIT_TARGET_TYPE_LABELS[row.original.targetType]}
        </span>
        {row.original.targetHref ? (
          <Link
            href={row.original.targetHref}
            className="break-all font-mono text-xs text-primary hover:underline"
          >
            {row.original.targetId}
          </Link>
        ) : (
          <span className="break-all font-mono text-xs">{row.original.targetId}</span>
        )}
      </div>
    ),
  }),
  column.accessor("subject", {
    header: "Subject",
    cell: ({ row }) => (
      <UserLink
        user={row.original.subject}
        href={row.original.subjectHref}
        fallbackId={row.original.subjectUserId}
      />
    ),
  }),
  column.accessor("reason", {
    header: "Reason",
    meta: { className: "max-w-xs" },
    cell: ({ getValue }) =>
      getValue() ? <span className="whitespace-pre-wrap break-words">{getValue()}</span> : <Placeholder />,
  }),
  column.accessor("detailsText", {
    header: "Details",
    meta: { className: "max-w-xs" },
    // Ids and state values, rendered as plain text, never HTML.
    cell: ({ getValue }) =>
      getValue() ? <span className="break-all font-mono text-xs">{getValue()}</span> : <Placeholder />,
  }),
]);

/** The audit entries on this page, newest first, as the server paged them. */
export function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  return (
    <DataTable columns={columns} data={rows} empty="No admin actions yet." getRowId={(row) => row.id} />
  );
}
