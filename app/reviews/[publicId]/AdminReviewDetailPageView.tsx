import Link from "next/link";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { AdminSidebar } from "@/app/_workspace/AdminSidebar";
import { updatePublishedJourneyReviewAction } from "@/app/_workspace/actions";
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

const detailLayoutStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.7fr) minmax(18rem, 24rem)",
  gap: "var(--spacing-3, 0.75rem)",
  alignItems: "start",
} as const;

const photoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
  gap: "0.75rem",
} as const;

function resolveBadgeVariant(status: AdminReviewStatus): "warning" | "success" | "error" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  return "warning";
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
    status: options.status === "pending" ? null : options.status,
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
  pendingCount,
}: {
  banner: AdminDashboardBanner | null;
  pendingCount: number;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Heading level={2}>Review evidence</Heading>
        <Badge
          label={`${pendingCount} pending`}
          variant={pendingCount > 0 ? "warning" : "neutral"}
        />
      </HStack>

      {banner ? (
        <Banner
          status={
            banner.tone === "error"
              ? "error"
              : banner.tone === "success"
                ? "success"
                : "info"
          }
          title={banner.message}
        />
      ) : null}
    </VStack>
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
    <Card padding={3}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <VStack gap={0.5}>
          <Text type="label" size="2xs" color="secondary">
            {section.kind === "cluster"
              ? `Cluster ${String(index + 1).padStart(2, "0")}`
              : "Remaining"}
          </Text>
          <Heading level={3}>{title}</Heading>
        </VStack>

        <Badge label={`${section.photoCount} photos`} variant="neutral" />
      </HStack>

      {section.photos.length > 0 ? (
        <div style={photoGridStyle}>
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
        <EmptyState
          title="No photo assets resolved"
          description="This cluster exists in the moderation payload, but no photo assets were attached to it."
          isCompact
        />
      )}
    </Card>
  );
}

function EmptyEvidenceCard({ detail }: { detail: AdminReviewDetail }) {
  return (
    <Card padding={3}>
      <EmptyState
        title="No evidence photos available"
        description={
          detail.evidence.unavailableReason ??
          "The admin detail contract did not return any photo evidence for this journey."
        }
      />
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
  return (
    <Card padding={3}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <Link href={backHref}>
          <Button variant="secondary" size="sm" label="Back to reviews" />
        </Link>

        <Badge
          label={getAdminReviewStatusLabel(detail.journey.review.status)}
          variant={resolveBadgeVariant(detail.journey.review.status)}
        />
      </HStack>

      <VStack gap={1} style={{ marginTop: 12 }}>
        <Text type="label" size="2xs" color="secondary">Journey</Text>
        <Heading level={1}>
          {detail.journey.title || "Untitled journey"}
        </Heading>
        {detail.journey.description ? (
          <Text type="body" color="secondary">{detail.journey.description}</Text>
        ) : null}
      </VStack>
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
    <Card padding={3}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <Heading level={3}>Review status</Heading>
        {reviewMutation ? (
          <Badge
            label={getAdminReviewStatusLabel(reviewMutation.reviewStatus)}
            variant={resolveBadgeVariant(reviewMutation.reviewStatus)}
          />
        ) : null}
      </HStack>

      <form action={updatePublishedJourneyReviewAction} style={{ marginTop: 12 }}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="targetPublicId" value={effectiveTargetPublicId} />

        <VStack gap={2}>
          <Text type="label" size="2xs" color="secondary">Review status</Text>
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                ["PENDING", "Pending"],
                ["APPROVED", "Approved"],
                ["REJECTED", "Rejected"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-element, 8px)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="reviewStatus"
                  value={value}
                  defaultChecked={defaultReviewStatus === value}
                />
                <Text type="body" size="sm">{label}</Text>
              </label>
            ))}
          </div>
        </VStack>

        <div style={{ marginTop: 12 }}>
          <Button type="submit" variant="primary" label="Save" />
        </div>
      </form>
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
    status: queue.status === "pending" ? null : queue.status,
  });

  return (
    <Layout
      height="fill"
      start={
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
              badge: String(queue.summary.pendingCount),
            },
            {
              tab: "articles",
              href: buildAdminArticleWorkspaceHref(),
              label: "Articles",
            },
          ]}
          session={session}
        />
      }
      content={
        <LayoutContent isScrollable>
          <PageHeader
            banner={banner}
            pendingCount={queue.summary.pendingCount}
          />

          <div style={detailLayoutStyle}>
            <VStack gap={4}>
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
            </VStack>

            <VStack gap={3}>
              <ReviewUpdatePanel
                detail={detail}
                reviewMutation={reviewMutation}
                returnTo={returnTo}
                targetPublicId={targetPublicId}
              />
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
