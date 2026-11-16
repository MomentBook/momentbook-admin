import Link from "next/link";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { FilterTabs } from "@/components/filter-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import type { Flash } from "@/lib/navigation/flash";
import {
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
  REVIEW_QUEUE_TABS,
  type ReviewQueueTab,
} from "@/lib/navigation/review-routes";
import { SLACK_TRANSLATION_NOTE } from "@/lib/workspace/attention";
import type { AdminReviewBanner } from "@/features/reviews/flash";
import type { ReviewQueuePage } from "@/features/reviews/queue-loader";
import { ReviewBanner } from "./review-flash-banner";
import { ReviewQueueTable, type ReviewQueueRow } from "./review-queue-table";

const TAB_LABELS: Record<ReviewQueueTab, string> = {
  pending: "Pending",
  translation: "Translation",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
};

/** The author filter as a chip; following it clears the filter. */
function AuthorFilterChip({ queue }: { queue: ReviewQueuePage }) {
  if (!queue.userId) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge asChild variant="secondary" className="max-w-full">
        <Link
          href={buildAdminReviewQueueHref({ status: queue.tab })}
          aria-label={`Clear author filter ${queue.userId}`}
        >
          <span className="truncate">
            Author: <span className="font-mono">{queue.userId}</span>
          </span>
          <XIcon aria-hidden />
        </Link>
      </Badge>
    </div>
  );
}

function EmptyQueue({ queue }: { queue: ReviewQueuePage }) {
  const allClear = queue.tab === "pending" && queue.total === 0 && !queue.userId;

  return (
    <Empty className="border">
      <EmptyHeader>
        {allClear ? (
          <EmptyMedia variant="icon">
            <CircleCheckIcon className="text-emerald-600" aria-hidden />
          </EmptyMedia>
        ) : null}
        <EmptyTitle>
          {allClear ? "All clear — nothing waiting for review." : "No journeys match this view."}
        </EmptyTitle>
      </EmptyHeader>
      {!allClear && queue.page > 1 ? (
        <EmptyContent>
          <Button asChild variant="outline" size="sm">
            <Link href={buildAdminReviewQueueHref({ status: queue.tab, userId: queue.userId })}>
              Go to page 1
            </Link>
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function ReviewQueueView({
  banner,
  queue,
  returnTo,
}: {
  banner: AdminReviewBanner | Flash | null;
  queue: ReviewQueuePage;
  returnTo: string;
}) {
  // The explicit status is the queue context; it turns on auto-advance for
  // the pending tab (see loadReviewDetailParams).
  const detailQuery = {
    status: queue.tab,
    page: queue.page > 1 ? String(queue.page) : null,
    userId: queue.userId,
  };
  const rows: ReviewQueueRow[] = queue.items.map((item) => ({
    ...item,
    detailHref: buildAdminReviewDetailHref(item.publicId, detailQuery),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>
        <p className="text-sm text-muted-foreground">
          Published journeys stay private until you approve them. Approved journeys go public
          once their translation lands.
        </p>
      </div>

      <ReviewBanner banner={banner} returnTo={returnTo} />

      <FilterTabs
        label="Review status"
        items={REVIEW_QUEUE_TABS.map((tab) => ({
          label: TAB_LABELS[tab],
          href: buildAdminReviewQueueHref({ status: tab, userId: queue.userId }),
          active: tab === queue.tab,
          count: queue.tabTotals[tab],
        }))}
      />

      <AuthorFilterChip queue={queue} />

      {queue.tab === "translation" ? (
        <p className="text-xs text-muted-foreground">
          Every journey whose translation has not landed, in any review status.{" "}
          {SLACK_TRANSLATION_NOTE}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <ReviewQueueTable rows={rows} />
          </div>
          <UrlPagination
            page={queue.page}
            pages={queue.pages}
            hrefFor={(page) =>
              buildAdminReviewQueueHref({ status: queue.tab, page, userId: queue.userId })
            }
          />
        </>
      ) : (
        <EmptyQueue queue={queue} />
      )}
    </div>
  );
}
