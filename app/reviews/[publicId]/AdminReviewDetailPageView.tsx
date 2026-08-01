import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  requeueJourneyReviewAction,
  updatePublishedJourneyReviewAction,
} from "@/app/_workspace/actions";
import { buildAdminWorkspaceHref } from "@/lib/admin/paths";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import {
  getAdminReviewStatusLabel,
  type AdminReviewDetail,
  type AdminReviewEvidenceSection,
  type AdminReviewPhoto,
  type AdminReviewQueueData,
  type AdminReviewQueueStatus,
  type AdminReviewStatus,
} from "@/lib/admin/reviews";
import type { AdminSession } from "@/lib/admin/session";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { LightboxPhotoTile } from "./LightboxPhotoTile";

type ReviewMutationSummary = {
  publicId: string;
  reviewStatus: AdminReviewStatus;
};

type AdminReviewDetailPageViewProps = {
  banner: AdminDashboardBanner | null;
  detail: AdminReviewDetail;
  queue: AdminReviewQueueData;
  reviewMutation: ReviewMutationSummary | null;
  returnTo: string;
  session: AdminSession;
  targetPublicId: string | null;
};

function badgeVariantClass(status: AdminReviewStatus): "default" | "destructive" | "secondary" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

function buildTabHref(
  tab: "overview" | "reviews",
  options: {
    page: number;
    status: AdminReviewQueueStatus;
  },
): string {
  return buildAdminWorkspaceHref(tab, {
    page: options.page > 1 ? String(options.page) : null,
    status: options.status === "flagged" ? null : options.status,
  });
}

function resolveDefaultReviewStatus(options: {
  detail: AdminReviewDetail;
  reviewMutation: ReviewMutationSummary | null;
  targetPublicId: string | null;
}): AdminReviewStatus {
  const trimmedTarget = options.targetPublicId?.trim() || "";
  const activeTarget = trimmedTarget || options.detail.journey.publicId;

  if (
    options.reviewMutation &&
    options.reviewMutation.publicId === activeTarget
  ) {
    return options.reviewMutation.reviewStatus;
  }

  if (!trimmedTarget || trimmedTarget === options.detail.journey.publicId) {
    return options.detail.journey.review.status;
  }

  return "PENDING";
}

function getSectionHeading(
  section: AdminReviewEvidenceSection,
  index: number,
  totalSections: number,
): string {
  if (section.kind === "remaining") {
    return totalSections === 1 ? "All photos" : "Additional photos";
  }

  if (section.title) {
    return section.title;
  }

  return `Cluster ${String(index + 1).padStart(2, "0")}`;
}

function buildPhotoAltText(
  sectionTitle: string,
  index: number,
  total: number,
): string {
  return `${sectionTitle} photo ${index} of ${total}`;
}

function PageHeader({
  banner,
  flaggedCount,
}: {
  banner: AdminDashboardBanner | null;
  flaggedCount: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Review evidence</h2>
        <Badge variant={flaggedCount > 0 ? "secondary" : "outline"}>
          {flaggedCount} flagged
        </Badge>
      </div>

      {banner ? (
        <Alert
          variant={
            banner.tone === "error"
              ? "destructive"
              : banner.tone === "success"
                ? "default"
                : "default"
          }
        >
          <AlertTitle>{banner.message}</AlertTitle>
        </Alert>
      ) : null}
    </div>
  );
}

function PhotoTile({
  photo,
  photoIndex,
  sectionTitle,
  total,
}: {
  photo: AdminReviewPhoto;
  photoIndex: number;
  sectionTitle: string;
  total: number;
}) {
  const alt = buildPhotoAltText(sectionTitle, photoIndex, total);
  const label = photo.locationName || "Journey photo";
  const triggerLabel = `Open ${sectionTitle} photo ${photoIndex} of ${total}`;
  const sizes = "(max-width: 900px) 100vw, (max-width: 1320px) 50vw, 22rem";

  return (
    <LightboxPhotoTile
      photo={photo}
      label={label}
      alt={alt}
      sizes={sizes}
      triggerLabel={triggerLabel}
    />
  );
}

function EvidenceSectionCard({
  index,
  section,
  totalSections,
}: {
  index: number;
  section: AdminReviewEvidenceSection;
  totalSections: number;
}) {
  const title = getSectionHeading(section, index, totalSections);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {section.kind === "cluster"
                ? `Cluster ${String(index + 1).padStart(2, "0")}`
                : "Remaining"}
            </span>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="outline">{section.photoCount} photos</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {section.photos.length > 0 ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))" }}>
            {section.photos.map((photo, photoIndex) => (
              <PhotoTile
                key={photo.key}
                photo={photo}
                photoIndex={photoIndex + 1}
                sectionTitle={title}
                total={section.photos.length}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <h3 className="text-lg font-semibold">No photo assets resolved</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This cluster exists in the moderation payload, but no photo assets were attached to it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyEvidenceCard({ detail }: { detail: AdminReviewDetail }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-semibold">No evidence photos available</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {detail.evidence.unavailableReason ??
            "The admin detail contract did not return any photo evidence for this journey."}
        </p>
      </CardContent>
    </Card>
  );
}

function JourneySummary({
  detail,
  backHref,
}: {
  detail: AdminReviewDetail;
  backHref: string;
}) {
  const review = detail.journey.review;

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between gap-2">
          <Link href={backHref}>
            <Button variant="outline" size="sm">Back to reviews</Button>
          </Link>

          <Badge variant={badgeVariantClass(review.status)}>
            {getAdminReviewStatusLabel(review.status)}
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Journey</span>
          <h1 className="text-2xl font-bold">
            {detail.journey.title || "Untitled journey"}
          </h1>
          {detail.journey.description ? (
            <p className="text-sm text-muted-foreground">{detail.journey.description}</p>
          ) : null}
        </div>

        {review.flagged ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">AI Review Flag</span>
            {review.flagReasons && review.flagReasons.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {review.flagReasons.map((reason) => (
                  <Badge key={reason} variant="secondary">{reason}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Flagged for manual review
              </p>
            )}
            {review.decidedBy && (
              <p className="text-xs text-muted-foreground">
                Flagged by {review.decidedBy}
                {review.decidedAt ? ` · ${new Date(review.decidedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}` : ""}
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReviewUpdatePanel({
  detail,
  reviewMutation,
  returnTo,
  targetPublicId,
}: {
  detail: AdminReviewDetail;
  reviewMutation: ReviewMutationSummary | null;
  returnTo: string;
  targetPublicId: string | null;
}) {
  const effectiveTargetPublicId = targetPublicId ?? detail.journey.publicId;
  const defaultReviewStatus = resolveDefaultReviewStatus({
    detail,
    reviewMutation,
    targetPublicId,
  });
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Review status</CardTitle>
          {reviewMutation ? (
            <Badge variant={badgeVariantClass(reviewMutation.reviewStatus)}>
              {getAdminReviewStatusLabel(reviewMutation.reviewStatus)}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <form action={updatePublishedJourneyReviewAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="targetPublicId" value={effectiveTargetPublicId} />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Review status</span>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["APPROVED", "Approved"],
                    ["REJECTED", "Rejected"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="reviewStatus"
                      value={value}
                      defaultChecked={defaultReviewStatus === value}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" variant="default">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RequeuePanel({
  detail,
  returnTo,
}: {
  detail: AdminReviewDetail;
  returnTo: string;
}) {
  const isFlagged = detail.journey.review.flagged;

  if (!isFlagged) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This journey was flagged by the AI review pipeline. If you believe the
          flag was incorrect, re-enqueue it for another review cycle.
        </p>

        <form action={requeueJourneyReviewAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="targetPublicId" value={detail.journey.publicId} />
          <Button type="submit" variant="outline">Re-enqueue for AI review</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminReviewDetailPageView({
  banner,
  detail,
  queue,
  reviewMutation,
  returnTo,
  session,
  targetPublicId,
}: AdminReviewDetailPageViewProps) {
  const backHref = buildAdminWorkspaceHref("reviews", {
    page: queue.page > 1 ? String(queue.page) : null,
    status: queue.status === "flagged" ? null : queue.status,
  });

  const sidebar = (
    <AdminSidebar
      activeTab="reviews"
      navigationItems={[
        {
          tab: "overview",
          href: buildTabHref("overview", {
            page: queue.page,
            status: queue.status,
          }),
          label: "Overview",
        },
        {
          tab: "reviews",
          href: buildTabHref("reviews", {
            page: queue.page,
            status: queue.status,
          }),
          label: "Reviews",
          badge: String(queue.summary.flaggedCount),
        },
        {
          tab: "articles",
          href: buildAdminArticleWorkspaceHref(),
          label: "Articles",
        },
      ]}
      session={session}
    />
  );

  return (
    <AdminShell sidebar={sidebar}>
      <div className="flex flex-col gap-4">
        <PageHeader
          banner={banner}
          flaggedCount={queue.summary.flaggedCount}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <JourneySummary detail={detail} backHref={backHref} />
            {detail.evidence.sections.length > 0 ? (
              detail.evidence.sections.map((section, index) => (
                <EvidenceSectionCard
                  key={section.key}
                  index={index}
                  section={section}
                  totalSections={detail.evidence.sections.length}
                />
              ))
            ) : (
              <EmptyEvidenceCard detail={detail} />
            )}
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-80 lg:shrink-0">
            <ReviewUpdatePanel
              detail={detail}
              reviewMutation={reviewMutation}
              returnTo={returnTo}
              targetPublicId={targetPublicId}
            />
            <RequeuePanel
              detail={detail}
              returnTo={returnTo}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
