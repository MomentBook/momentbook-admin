"use client";

import Link from "next/link";
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { ReasonField } from "@/components/reason-field";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { Badge } from "@/components/ui/badge";
import type { AdminCommentItemDto } from "@/lib/api/types";
import { commentDeletedLabel } from "@/entities/comment/model";
import { USER_STATUS_LABELS, USER_STATUS_TONES } from "@/entities/user/model";
import { deleteAdminCommentAction } from "@/features/comments/actions";

/** A comment row with its author's and journey's links, built on the server. */
export type CommentRow = AdminCommentItemDto & { authorHref: string; journeyHref: string };

const column = createColumnHelper<DataTableFeatures, CommentRow>();

function DeleteComment({ comment, returnTo }: { comment: CommentRow; returnTo: string }) {
  const author = comment.author.name || comment.author.id;

  return (
    <ConfirmActionForm
      action={deleteAdminCommentAction}
      fields={{ commentId: comment.commentId, returnTo }}
      triggerLabel="Delete"
      triggerVariant="destructive"
      title={`Delete this comment by ${author}?`}
      description="Hidden from the journey for everyone. The author is not notified."
      confirmLabel="Delete"
    >
      <ReasonField id={`comment-reason-${comment.commentId}`} />
    </ConfirmActionForm>
  );
}

/** `returnTo` is the list as it is now, where a delete comes back to. */
function commentColumns(returnTo: string) {
  return column.columns([
    column.accessor("body", {
      header: "Comment",
      meta: { className: "max-w-md" },
      // User content: rendered as text, line breaks kept.
      cell: ({ getValue }) => <p className="whitespace-pre-wrap break-words">{getValue()}</p>,
    }),
    column.accessor("author", {
      header: "Author",
      cell: ({ row }) => {
        const { author } = row.original;

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={row.original.authorHref} className="font-medium text-primary hover:underline">
              {author.name || "Unnamed user"}
            </Link>
            {author.status !== "ACTIVE" ? (
              <StatusBadge tone={USER_STATUS_TONES[author.status]}>
                {USER_STATUS_LABELS[author.status]}
              </StatusBadge>
            ) : null}
          </div>
        );
      },
    }),
    column.accessor("publicId", {
      header: "Journey",
      cell: ({ row }) => (
        <Link
          href={row.original.journeyHref}
          className="font-mono text-xs text-primary hover:underline"
        >
          {row.original.publicId}
        </Link>
      ),
    }),
    column.accessor("createdAt", {
      header: "Posted",
      cell: ({ getValue }) => <Time value={getValue()} withTime />,
    }),
    column.accessor("status", {
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "DELETED" ? (
          <Badge variant="secondary">{commentDeletedLabel(row.original.deletedByRole)}</Badge>
        ) : (
          <Badge>Active</Badge>
        ),
    }),
    column.display({
      id: "action",
      header: "Action",
      meta: { className: "text-right" },
      cell: ({ row }) =>
        row.original.status === "ACTIVE" ? (
          <DeleteComment comment={row.original} returnTo={returnTo} />
        ) : null,
    }),
  ]);
}

/** The comments on this page, as the server filtered and paged them. */
export function CommentsTable({ rows, returnTo }: { rows: CommentRow[]; returnTo: string }) {
  const columns = useMemo(() => commentColumns(returnTo), [returnTo]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      empty="No comments here."
      getRowId={(row) => row.commentId}
    />
  );
}
