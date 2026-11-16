"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { Placeholder } from "@/components/detail-parts";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import type { AdminUserListItemDto } from "@/lib/api/types";
import { USER_STATUS_LABELS, USER_STATUS_TONES } from "@/entities/user/model";

/** A user row with its detail link, built on the server. */
export type UserRow = AdminUserListItemDto & { detailHref: string };

const column = createColumnHelper<DataTableFeatures, UserRow>();

const columns = column.columns([
  column.accessor("name", {
    header: "User",
    cell: ({ row }) => (
      <>
        <Link href={row.original.detailHref} className="font-medium text-primary hover:underline">
          {row.original.name || "Unnamed user"}
        </Link>
        <div className="font-mono text-xs text-muted-foreground">{row.original.userId}</div>
      </>
    ),
  }),
  column.accessor("email", {
    header: "Email",
    cell: ({ row }) => (
      <>
        <div>{row.original.email ?? <Placeholder />}</div>
        {row.original.providerEmail && row.original.providerEmail !== row.original.email ? (
          <div className="text-xs text-muted-foreground">{row.original.providerEmail}</div>
        ) : null}
      </>
    ),
  }),
  column.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <StatusBadge tone={USER_STATUS_TONES[getValue()]}>{USER_STATUS_LABELS[getValue()]}</StatusBadge>
    ),
  }),
  column.accessor("provider", {
    header: "Provider",
    cell: ({ getValue }) => {
      const provider = getValue();
      return provider ? <span className="capitalize">{provider.toLowerCase()}</span> : <Placeholder />;
    },
  }),
  column.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => (getValue() === "ADMIN" ? <Badge>Admin</Badge> : <span>User</span>),
  }),
  column.accessor("publishedJourneyCount", {
    header: "Published",
    meta: { className: "text-right tabular-nums" },
  }),
  column.accessor("createdAt", {
    header: "Joined",
    cell: ({ getValue }) => <Time value={getValue()} />,
  }),
]);

/** The users on this page, as the server filtered and paged them. */
export function UsersTable({ rows }: { rows: UserRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      empty="No users match these filters."
      getRowId={(row) => row.userId}
    />
  );
}
