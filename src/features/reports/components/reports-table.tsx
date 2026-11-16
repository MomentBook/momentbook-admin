"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminReportItemDto } from "@/lib/api/types";
import {
  getReportReasonLabel,
  getReportStatusLabel,
  getReportTargetTypeLabel,
  REPORT_STATUS_TONES,
} from "@/entities/report/model";

/** A report row with its detail link, built on the server. */
export type ReportRow = AdminReportItemDto & { detailHref: string };

const column = createColumnHelper<DataTableFeatures, ReportRow>();

const columns = column.columns([
  column.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <StatusBadge tone={REPORT_STATUS_TONES[getValue()]}>
        {getReportStatusLabel(getValue())}
      </StatusBadge>
    ),
  }),
  column.accessor("targetType", {
    header: "Target",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold">
          {getReportTargetTypeLabel(row.original.targetType)}
        </span>
        <span className="max-w-[140px] truncate font-mono text-xs text-muted-foreground">
          {row.original.targetId}
        </span>
      </div>
    ),
  }),
  column.accessor("reason", {
    header: "Reason",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs">
        {getReportReasonLabel(getValue())}
      </Badge>
    ),
  }),
  column.accessor("description", {
    header: "Description",
    meta: { className: "max-w-[220px]" },
    cell: ({ getValue }) => (
      <p className="truncate text-xs text-muted-foreground">{getValue() || "—"}</p>
    ),
  }),
  column.accessor("targetReportCounts", {
    header: "Reports on target",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="text-xs">
        {getValue().effectiveReports} effective / {getValue().totalReports} total
      </Badge>
    ),
  }),
  column.accessor("reporterId", {
    header: "Reporter",
    cell: ({ row }) => (
      <span className="block max-w-[120px] truncate font-mono text-xs">
        {row.original.reporter?.name || row.original.reporter?.email || row.original.reporterId}
      </span>
    ),
  }),
  column.accessor("createdAt", {
    header: "Created",
    cell: ({ getValue }) => <Time value={getValue()} />,
  }),
  column.display({
    id: "action",
    header: "Action",
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={row.original.detailHref}>Inspect</Link>
      </Button>
    ),
  }),
]);

/** The reports on this page, as the server filtered and paged them. */
export function ReportsTable({ rows }: { rows: ReportRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      empty="There are no reports matching the selected filters."
      getRowId={(row) => row.id}
    />
  );
}
