import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalizedDate } from "@/components/LocalizedTime";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminReviewDetailHref,
  buildAdminWorkspaceHref,
  type AdminWorkspaceTab,
} from "@/lib/admin/paths";
import { getAdminReviewStatusLabel } from "@/lib/admin/reviews";
import type {
  AdminOverviewData,
  AdminReviewQueueData,
  AdminReviewQueueStatus,
  AdminReviewStatus,
} from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminDashboardBanner } from "./workspace-data";
import { AdminOverviewPanel } from "./AdminOverviewPanel";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type AdminWorkspaceProps = {
  activeTab: AdminWorkspaceTab;
  banner: AdminDashboardBanner | null;
  overview: AdminOverviewData;
  queue: AdminReviewQueueData;
  session: AdminSession;
};

function badgeVariantClass(status: AdminReviewStatus): "default" | "destructive" | "secondary" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

function buildReviewFilterHref(status: AdminReviewQueueStatus): string {
  return buildAdminWorkspaceHref("reviews", {
    status: status === "flagged" ? null : status,
    page: null,
  });
}

function buildReviewDetailTableHref(
  publicId: string,
  options: {
    page: number;
    status: AdminReviewQueueStatus;
  },
): string {
  return buildAdminReviewDetailHref(publicId, {
    page: options.page > 1 ? String(options.page) : null,
    status: options.status === "flagged" ? null : options.status,
  });
}

function getActiveTabTitle(tab: AdminWorkspaceTab): string {
  if (tab === "reviews") {
    return "Review Queue";
  }
  return "Overview";
}

function getActiveTabDescription(tab: AdminWorkspaceTab): string {
  if (tab === "reviews") {
    return "Review journeys that the AI review pipeline flagged as unsafe. Decide to approve or reject each flagged item.";
  }
  return "Monitor flagged journey volume, review decisions, and submission flow over the past weeks.";
}

function ContentHeader({
  banner,
  description,
  flaggedCount,
  title,
}: {
  banner: AdminDashboardBanner | null;
  description: string;
  flaggedCount: number;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Badge variant={flaggedCount > 0 ? "secondary" : "outline"}>
        {flaggedCount} flagged
      </Badge>

      {banner ? (
        <Alert variant={banner.tone === "error" ? "destructive" : banner.tone === "success" ? "default" : "default"}>
          <AlertTitle>{banner.message}</AlertTitle>
        </Alert>
      ) : null}
    </div>
  );
}

function ReviewTablePanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Queue</span>
          <CardTitle className="text-lg">Reviews</CardTitle>
        </div>
        <CardDescription>{queue.total} items</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["flagged", "Flagged"],
              ["pending", "All pending"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <Link key={value} href={buildReviewFilterHref(value)}>
              <Badge variant={queue.status === value ? "default" : "outline"}>
                {label}
              </Badge>
            </Link>
          ))}
        </div>

        {queue.items.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged</TableHead>
                    <TableHead>Journey</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Public ID</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.items.map((item) => (
                    <TableRow key={item.publicId}>
                      <TableCell>
                        <Badge variant={badgeVariantClass(item.review.status)}>
                          {getAdminReviewStatusLabel(item.review.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.review.flagged ? (
                          <Badge variant="secondary">
                            {item.review.flagReasons?.length ? item.review.flagReasons.join(", ") : "Flagged"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={buildReviewDetailTableHref(item.publicId, {
                            page: queue.page,
                            status: queue.status,
                          })}
                          className="text-primary hover:underline"
                        >
                          {item.title || "Untitled journey"}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.userId}</TableCell>
                      <TableCell className="font-mono text-xs">{item.publicId}</TableCell>
                      <TableCell>{item.visibility}</TableCell>
                      <TableCell>{item.photoCount}</TableCell>
                      <TableCell>
                        <LocalizedDate
                          lang={ADMIN_DISPLAY_LANGUAGE}
                          timestamp={Date.parse(item.createdAt)}
                        />
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {queue.pages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={buildAdminWorkspaceHref("reviews", {
                    page:
                      queue.page > 1 ? String(Math.max(1, queue.page - 1)) : null,
                    status: queue.status === "flagged" ? null : queue.status,
                  })}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={queue.page <= 1}
                  >
                    Previous
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Page {queue.page} of {queue.pages}
                </span>
                <Link
                  href={buildAdminWorkspaceHref("reviews", {
                    page:
                      queue.page < queue.pages
                        ? String(Math.min(queue.pages, queue.page + 1))
                        : String(queue.pages),
                    status: queue.status === "flagged" ? null : queue.status,
                  })}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={queue.page >= queue.pages}
                  >
                    Next
                  </Button>
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <h3 className="text-lg font-semibold">No records in this filter</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch the filter or return to flagged items.
              </p>
              {queue.status !== "flagged" ? (
                <Link href={buildAdminWorkspaceHref("reviews")} className="mt-4">
                  <Button variant="default" size="sm">Show flagged</Button>
                </Link>
              ) : null}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewsPanel({
  queue,
}: {
  queue: AdminReviewQueueData;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ReviewTablePanel queue={queue} />
    </div>
  );
}

export function AdminWorkspace({
  activeTab,
  banner,
  overview,
  queue,
  session,
}: AdminWorkspaceProps) {
  const navigationItems = [
    {
      tab: "overview" as const,
      href: buildAdminWorkspaceHref("overview"),
      label: "Overview",
    },
    {
      tab: "reviews" as const,
      href: buildAdminWorkspaceHref("reviews"),
      label: "Reviews",
      badge: String(queue.summary.flaggedCount),
    },
    {
      tab: "articles" as const,
      href: buildAdminArticleWorkspaceHref(),
      label: "Articles",
    },
  ];

  const sidebar = (
    <AdminSidebar
      activeTab={activeTab}
      navigationItems={navigationItems}
      session={session}
    />
  );

  return (
    <AdminShell sidebar={sidebar}>
      <div className="flex flex-col gap-4">
        <ContentHeader
          banner={banner}
          description={getActiveTabDescription(activeTab)}
          flaggedCount={queue.summary.flaggedCount}
          title={getActiveTabTitle(activeTab)}
        />

        {activeTab === "reviews" ? (
          <ReviewsPanel queue={queue} />
        ) : (
          <AdminOverviewPanel overview={overview} session={session} />
        )}
      </div>
    </AdminShell>
  );
}
