import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { LocalizedDateTime } from "@/components/LocalizedTime";
import { cn } from "@/lib/utils";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import {
  buildAdminCommentsHref,
  buildAdminReviewDetailHref,
  buildAdminUserHref,
} from "@/lib/admin/paths";
import type { AdminCommentsWorkspaceData } from "@/lib/admin/comments";
import { COMMENT_DELETED_BY_LABELS, type CommentStatusTab } from "@/lib/admin/comments-shared";
import { USER_STATUS_LABELS, userStatusBadgeVariant } from "@/lib/admin/users-shared";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminCommentItemDto } from "@/src/apis/types";
import { deleteAdminCommentAction } from "./actions";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type CommentsFilters = {
  tab: CommentStatusTab;
  userId?: string;
  publicId?: string;
};

const TABS: ReadonlyArray<{ label: string; tab: CommentStatusTab }> = [
  { label: "Active", tab: "active" },
  { label: "Deleted", tab: "deleted" },
  { label: "All", tab: "all" },
];

function hrefFor(filters: CommentsFilters, page?: number): string {
  return buildAdminCommentsHref({
    // Active is the default tab, so its URL carries no status.
    status: filters.tab === "active" ? null : filters.tab,
    userId: filters.userId,
    publicId: filters.publicId,
    page,
  });
}

function chipClass(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-sm",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

function Filters({ filters }: { filters: CommentsFilters }) {
  const chips = [
    filters.userId
      ? { label: `Author ${filters.userId}`, clear: { ...filters, userId: undefined } }
      : null,
    filters.publicId
      ? { label: `Journey ${filters.publicId}`, clear: { ...filters, publicId: undefined } }
      : null,
  ].filter((chip) => chip !== null);

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Comment status" className="flex flex-wrap gap-2">
        {TABS.map(({ label, tab }) => {
          const active = tab === filters.tab;

          return (
            <Link
              key={tab}
              href={hrefFor({ ...filters, tab })}
              aria-current={active ? "page" : undefined}
              className={chipClass(active)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {chips.map((chip) => (
            <Badge key={chip.label} variant="secondary" className="font-mono">
              {chip.label}
            </Badge>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor({ tab: filters.tab })}>Clear filters</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DeleteComment({ comment, returnTo }: { comment: AdminCommentItemDto; returnTo: string }) {
  const author = comment.author.name || comment.author.userId;

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
      <div className="grid gap-1.5">
        <Label htmlFor={`reason-${comment.commentId}`}>Reason (optional)</Label>
        <Input id={`reason-${comment.commentId}`} name="reason" maxLength={1000} />
        <p className="text-xs text-muted-foreground">Saved in the audit log.</p>
      </div>
    </ConfirmActionForm>
  );
}

function Pagination({ data, filters }: { data: AdminCommentsWorkspaceData; filters: CommentsFilters }) {
  if (data.pages <= 1) {
    return null;
  }

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

function EmptyState({ data, filters }: { data: AdminCommentsWorkspaceData; filters: CommentsFilters }) {
  const filtered = Boolean(filters.userId || filters.publicId);

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium">
          {filtered ? "No comments match these filters." : "No comments here."}
        </p>
        {filtered ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor({ tab: filters.tab })}>Clear filters</Link>
          </Button>
        ) : null}
        {/* Deleting the last comment on a later page lands here; page 1 keeps the filters. */}
        {data.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(filters)}>Go to page 1</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminCommentsListPageView({
  banner,
  data,
  filters,
  returnTo,
}: {
  banner: AdminDashboardBanner | null;
  data: AdminCommentsWorkspaceData;
  filters: CommentsFilters;
  returnTo: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} {data.total === 1 ? "comment" : "comments"}
        </p>
      </div>

      {banner ? (
        <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
          <AlertTitle className="line-clamp-none">{banner.message}</AlertTitle>
        </Alert>
      ) : null}

      <Filters filters={filters} />

      {data.comments.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comment</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Journey</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.comments.map((comment) => (
                  <TableRow key={comment.commentId}>
                    <TableCell className="max-w-md">
                      {/* User content: rendered as text, line breaks kept. */}
                      <p className="whitespace-pre-wrap break-words">{comment.body}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={buildAdminUserHref(comment.author.userId)}
                          className="font-medium text-primary hover:underline"
                        >
                          {comment.author.name || "Unnamed user"}
                        </Link>
                        {comment.author.status !== "ACTIVE" ? (
                          <Badge variant={userStatusBadgeVariant(comment.author.status)}>
                            {USER_STATUS_LABELS[comment.author.status]}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={buildAdminReviewDetailHref(comment.publicId)}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {comment.publicId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <LocalizedDateTime
                        lang={ADMIN_DISPLAY_LANGUAGE}
                        timestamp={Date.parse(comment.createdAt)}
                      />
                    </TableCell>
                    <TableCell>
                      {comment.status === "DELETED" ? (
                        <Badge variant="secondary">
                          Deleted
                          {comment.deletedByRole
                            ? ` by ${COMMENT_DELETED_BY_LABELS[comment.deletedByRole]}`
                            : ""}
                        </Badge>
                      ) : (
                        <Badge>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {comment.status === "ACTIVE" ? (
                        <DeleteComment comment={comment} returnTo={returnTo} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination data={data} filters={filters} />
        </>
      ) : (
        <EmptyState data={data} filters={filters} />
      )}
    </div>
  );
}
