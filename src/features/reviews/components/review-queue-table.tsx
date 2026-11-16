"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOffIcon } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { formatCount } from "@/lib/format/number";
import { getAdminReviewStatusLabel, REVIEW_STATUS_TONES } from "@/entities/journey/model";
import type { ReviewQueueItem } from "@/features/reviews/queue-loader";

/** A queue row with its link to the review page, built on the server with
 * the queue's tab, page and author filter. */
export type ReviewQueueRow = ReviewQueueItem & { detailHref: string };

const NONE = <span className="text-muted-foreground">—</span>;

const column = createColumnHelper<DataTableFeatures, ReviewQueueRow>();

const columns = column.columns([
  column.display({
    id: "cover",
    header: () => <span className="sr-only">Cover</span>,
    meta: { className: "w-16" },
    cell: ({ row }) => (
      <div className="relative size-12 overflow-hidden rounded-md bg-muted">
        {row.original.thumbnailUrl ? (
          <Image src={row.original.thumbnailUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <ImageOffIcon
            className="absolute inset-0 m-auto size-4 text-muted-foreground"
            aria-hidden
          />
        )}
      </div>
    ),
  }),
  column.accessor("title", {
    header: "Journey",
    cell: ({ row }) => (
      <>
        <Link href={row.original.detailHref} className="font-medium text-primary hover:underline">
          {row.original.title || "Untitled journey"}
        </Link>
        <div className="font-mono text-xs text-muted-foreground">{row.original.publicId}</div>
      </>
    ),
  }),
  column.accessor("userId", {
    header: "Author ID",
    meta: { className: "font-mono text-xs" },
  }),
  column.accessor("photoCount", {
    header: "Photos",
    meta: { className: "text-right tabular-nums" },
    cell: ({ getValue }) => formatCount(getValue()),
  }),
  column.accessor("submittedAt", {
    header: "Submitted",
    cell: ({ getValue }) => {
      const submittedAt = getValue();
      return submittedAt ? <Time value={submittedAt} /> : NONE;
    },
  }),
  column.accessor((row) => row.review.status, {
    id: "review",
    header: "Review",
    cell: ({ getValue }) => (
      <StatusBadge tone={REVIEW_STATUS_TONES[getValue()]}>
        {getAdminReviewStatusLabel(getValue())}
      </StatusBadge>
    ),
  }),
  column.display({
    id: "translation",
    header: "Translation",
    cell: ({ row }) =>
      row.original.review.enqueueFailed ? (
        <StatusBadge tone="danger">Failed</StatusBadge>
      ) : row.original.review.localizationPending ? (
        <StatusBadge tone="warning">Pending</StatusBadge>
      ) : (
        NONE
      ),
  }),
]);

/** The queue's rows, as the server paged them. */
export function ReviewQueueTable({ rows }: { rows: ReviewQueueRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      empty="No journeys match this view."
      getRowId={(row) => row.publicId}
    />
  );
}
