import Link from "next/link";
import { FilterChips } from "@/components/filter-chips";
import { FilterTabs } from "@/components/filter-tabs";
import { FlashBanner } from "@/components/flash-banner";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import { formatCount } from "@/lib/format/number";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminCommentsHref, buildAdminUserHref } from "@/lib/navigation/paths";
import { buildAdminReviewDetailHref } from "@/lib/navigation/review-routes";
import type { CommentStatusTab } from "@/entities/comment/model";
import type { AdminCommentsWorkspaceData } from "@/features/comments/loader";
import { CommentsTable, type CommentRow } from "./comments-table";

export type CommentsFilters = {
  tab: CommentStatusTab;
  userId?: string;
  publicId?: string;
};

const TABS: ReadonlyArray<{ label: string; tab: CommentStatusTab }> = [
  { label: "Active", tab: "active" },
  { label: "Deleted", tab: "deleted" },
  { label: "All", tab: "all" },
];

/** The list with these filters, at `page` (1 when left out). */
function hrefFor(filters: CommentsFilters, page?: number): string {
  return buildAdminCommentsHref({
    // Active is the default tab, so its URL carries no status.
    status: filters.tab === "active" ? null : filters.tab,
    userId: filters.userId,
    publicId: filters.publicId,
    page,
  });
}

function NoComments({ data, filters }: { data: AdminCommentsWorkspaceData; filters: CommentsFilters }) {
  const filtered = Boolean(filters.userId || filters.publicId);

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{filtered ? "No comments match these filters." : "No comments here."}</EmptyTitle>
      </EmptyHeader>
      {filtered || data.page > 1 ? (
        <EmptyContent className="flex-row justify-center">
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
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function CommentsView({
  banner,
  data,
  filters,
  returnTo,
}: {
  banner: Flash | null;
  data: AdminCommentsWorkspaceData;
  filters: CommentsFilters;
  returnTo: string;
}) {
  const rows: CommentRow[] = data.items.map((comment) => ({
    ...comment,
    authorHref: buildAdminUserHref(comment.author.id),
    journeyHref: buildAdminReviewDetailHref(comment.publicId),
  }));
  const chips = [
    filters.userId
      ? { label: "Author", value: filters.userId, clearHref: hrefFor({ ...filters, userId: undefined }) }
      : null,
    filters.publicId
      ? {
          label: "Journey",
          value: filters.publicId,
          clearHref: hrefFor({ ...filters, publicId: undefined }),
        }
      : null,
  ].filter((chip) => chip !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">
          {formatCount(data.total)} {data.total === 1 ? "comment" : "comments"}
        </p>
      </div>

      <FlashBanner flash={banner} />

      <div className="flex flex-col gap-3">
        <FilterTabs
          label="Comment status"
          variant="pill"
          items={TABS.map(({ label, tab }) => ({
            label,
            href: hrefFor({ ...filters, tab }),
            active: tab === filters.tab,
          }))}
        />
        <FilterChips chips={chips} clearAllHref={hrefFor({ tab: filters.tab })} />
      </div>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <CommentsTable rows={rows} returnTo={returnTo} />
          </div>
          <UrlPagination
            page={data.page}
            pages={data.pages}
            hrefFor={(page) => hrefFor(filters, page)}
          />
        </>
      ) : (
        <NoComments data={data} filters={filters} />
      )}
    </div>
  );
}
