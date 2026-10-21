import Image from "next/image";
import Link from "next/link";
import { CircleCheck, ImageOff } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalizedDate } from "@/components/LocalizedTime";
import { cn } from "@/lib/utils";
import { buildAdminReviewDetailHref, buildAdminReviewQueueHref } from "@/lib/admin/paths";
import { SLACK_TRANSLATION_NOTE } from "@/lib/admin/attention";
import type { ReviewQueuePage, ReviewQueueTab } from "@/lib/admin/review-queue";
import { getAdminReviewStatusLabel, type AdminReviewStatus } from "@/lib/admin/reviews";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

const TAB_LABELS: Record<ReviewQueueTab, string> = {
  pending: "Pending",
  translation: "Translation",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
};

const TAB_ORDER: ReviewQueueTab[] = ["pending", "translation", "approved", "rejected", "all"];

function reviewBadgeVariant(status: AdminReviewStatus): "default" | "destructive" | "secondary" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

function QueueTabs({ queue }: { queue: ReviewQueuePage }) {
  return (
    <nav aria-label="Review status" className="flex flex-wrap gap-1 border-b">
      {TAB_ORDER.map((tab) => {
        const active = tab === queue.tab;

        return (
          <Link
            key={tab}
            href={buildAdminReviewQueueHref({ status: tab })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB_LABELS[tab]}
            <Badge variant={active ? "default" : "outline"} className="tabular-nums">
              {queue.tabTotals[tab]}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}

function EmptyQueue({ queue }: { queue: ReviewQueuePage }) {
  if (queue.tab === "pending" && queue.total === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-8">
          <CircleCheck className="size-6 text-emerald-600" aria-hidden />
          <p className="font-medium">All clear — nothing waiting for review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium">No journeys match this view.</p>
        {queue.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildAdminReviewQueueHref({ status: queue.tab })}>Go to page 1</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Pagination({ queue }: { queue: ReviewQueuePage }) {
  if (queue.pages <= 1) {
    return null;
  }

  const previous = queue.page > 1 ? Math.min(queue.page - 1, queue.pages) : null;
  const next = queue.page < queue.pages ? queue.page + 1 : null;

  return (
    <div className="flex items-center justify-between gap-2">
      {previous ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildAdminReviewQueueHref({ status: queue.tab, page: previous })}>
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-xs text-muted-foreground">
        Page {queue.page} of {queue.pages}
      </span>
      {next ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildAdminReviewQueueHref({ status: queue.tab, page: next })}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}

export function ReviewQueuePageView({
  banner,
  queue,
}: {
  banner: AdminDashboardBanner | null;
  queue: ReviewQueuePage;
}) {
  const detailQuery = {
    status: queue.tab === "pending" ? null : queue.tab,
    page: queue.page > 1 ? String(queue.page) : null,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>
        <p className="text-sm text-muted-foreground">
          Published journeys stay private until you approve them. Approved journeys go public
          once their translation lands.
        </p>
      </div>

      {banner ? (
        <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
          <AlertTitle>{banner.message}</AlertTitle>
        </Alert>
      ) : null}

      <QueueTabs queue={queue} />

      {queue.tab === "translation" ? (
        <p className="text-xs text-muted-foreground">
          Every journey whose translation has not landed, in any review status.{" "}
          {SLACK_TRANSLATION_NOTE}
        </p>
      ) : null}

      {queue.items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">
                    <span className="sr-only">Cover</span>
                  </TableHead>
                  <TableHead>Journey</TableHead>
                  <TableHead>Author ID</TableHead>
                  <TableHead className="text-right">Photos</TableHead>
                  <TableHead>First published</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Translation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.items.map((item) => (
                  <TableRow key={item.publicId}>
                    <TableCell>
                      <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageOff
                            className="absolute inset-0 m-auto size-4 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={buildAdminReviewDetailHref(item.publicId, detailQuery)}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.title || "Untitled journey"}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.publicId}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.userId}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.photoCount}</TableCell>
                    <TableCell>
                      {item.publishedAt ? (
                        <LocalizedDate
                          lang={ADMIN_DISPLAY_LANGUAGE}
                          timestamp={Date.parse(item.publishedAt)}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reviewBadgeVariant(item.review.status)}>
                        {getAdminReviewStatusLabel(item.review.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.review.enqueueFailed ? (
                        <Badge variant="destructive">Enqueue failed</Badge>
                      ) : item.review.localizationPending ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination queue={queue} />
        </>
      ) : (
        <EmptyQueue queue={queue} />
      )}
    </div>
  );
}
