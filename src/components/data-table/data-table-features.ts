import { tableFeatures, type ColumnDef, type RowData } from "@tanstack/react-table";

/** What a column may set for its header and cells (alignment, width). */
export type DataTableColumnMeta = { className?: string };

/** The admin's tables only lay rows out: the server sorts, filters and pages
 * them, so no table state feature is on. */
export const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** A table's columns, made in a client module with
 * `createColumnHelper<DataTableFeatures, Row>().columns([...])`. Each column
 * keeps its own value type, so the array is typed as the helper types it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the column helper's own array type
export type DataTableColumns<TData extends RowData> = ReadonlyArray<ColumnDef<DataTableFeatures, TData, any>>;
