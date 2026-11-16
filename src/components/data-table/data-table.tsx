"use client";

import type { ReactNode } from "react";
import { useTable, type RowData } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dataTableFeatures, type DataTableColumns } from "./data-table-features";

/** A list page's rows in a shadcn table, as the server sorted and paged them.
 * `empty` fills the body when there are none. */
export function DataTable<TData extends RowData>({
  columns,
  data,
  empty,
  getRowId,
}: {
  columns: DataTableColumns<TData>;
  data: ReadonlyArray<TData>;
  empty: ReactNode;
  getRowId?: (row: TData) => string;
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
  });
  const rows = table.getRowModel().rows;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className={header.column.columnDef.meta?.className}
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllLeafColumns().length}
              className="h-24 text-center text-muted-foreground"
            >
              {empty}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
