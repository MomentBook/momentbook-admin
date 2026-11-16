"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import { getEditorialCategoryLabel } from "@/entities/article/copy";
import type { EditorialArticleListItem } from "@/entities/article/types";

/** An article row with its editor link (back to this list), built on the
 * server. */
export type ArticleRow = EditorialArticleListItem & { detailHref: string };

const column = createColumnHelper<DataTableFeatures, ArticleRow>();

const columns = column.columns([
  column.accessor("title", {
    header: "Title",
    cell: ({ row }) => (
      <Link href={row.original.detailHref} className="font-medium text-primary hover:underline">
        {row.original.title}
      </Link>
    ),
  }),
  column.accessor("language", {
    header: "Language",
    cell: ({ getValue }) => <Badge variant="outline">{getValue().toUpperCase()}</Badge>,
  }),
  column.accessor("category", {
    header: "Category",
    cell: ({ getValue }) => getEditorialCategoryLabel(getValue()),
    meta: { className: "whitespace-nowrap" },
  }),
  column.accessor("slug", {
    header: "Route",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        /{row.original.language}/guides/{row.original.slug}
      </span>
    ),
  }),
  column.accessor("readingMinutes", {
    header: "Reading time",
    cell: ({ getValue }) => `${getValue()} min`,
    meta: { className: "tabular-nums" },
  }),
  column.accessor("publishedAt", {
    header: "Published",
    cell: ({ getValue }) => <Time value={getValue()} />,
    meta: { className: "whitespace-nowrap" },
  }),
]);

/** The published articles on this page, as the server filtered and paged
 * them. */
export function ArticlesTable({ rows }: { rows: ArticleRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      empty="No articles match the current filters."
      getRowId={(row) => row.id}
    />
  );
}
