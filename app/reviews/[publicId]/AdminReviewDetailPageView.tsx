import Image from "next/image";
import Link from "next/link";
import { FullscreenImageDialog } from "@/components/FullscreenImageDialog";
import { AdminSidebar, type AdminSidebarNavigationItem } from "@/app/_workspace/AdminSidebar";
import { updatePublishedJourneyReviewAction } from "@/app/_workspace/actions";
import { buildAdminWorkspaceHref } from "@/lib/admin/paths";
import { buildAdminArticleWorkspaceHref } from "@/lib/admin/paths";
import { shouldBypassNextImageOptimization } from "@/lib/next-image-optimization";
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
import workspaceStyles from "@/app/_workspace/workspace.module.scss";
import styles from "./review-detail.module.scss";

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

function buildStatusClassName(status: AdminReviewStatus): string {
  if (status === "APPROVED") {
    return `${styles.statusBadge} ${styles.statusApproved}`;
  }

  if (status === "REJECTED") {
    return `${styles.statusBadge} ${styles.statusRejected}`;
  }

  return `${styles.statusBadge} ${styles.statusPending}`;
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
    <header className={workspaceStyles.contentHeader}>
      <div className={styles.headerRow}>
        <div className={workspaceStyles.headerCopy}>
          <div className={workspaceStyles.headerTitleRow}>
            <h2 className={workspaceStyles.contentTitle}>Review evidence</h2>
            <span className={workspaceStyles.pendingBadge}>
              {pendingCount} pending
            </span>
          </div>
        </div>
      </div>

      {banner ? (
        <p
          className={
            banner.tone === "error"
              ? workspaceStyles.bannerError
              : banner.tone === "success"
                ? workspaceStyles.bannerSuccess
                : workspaceStyles.banner
          }
          role="status"
          aria-live="polite"
        >
          {banner.message}
        </p>
      ) : null}
    </header>
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

  return (
    <FullscreenImageDialog
      src={photo.fullUrl}
      alt={alt}
      triggerAriaLabel={`Open ${sectionTitle} photo ${photoIndex} of ${total}`}
      dialogAriaLabel={`${sectionTitle} photo viewer`}
      closeAriaLabel="Close photo viewer"
      triggerClassName={styles.photoButton}
      imageSizes="(max-width: 900px) 100vw, (max-width: 1320px) 50vw, 22rem"
      trigger={
        <article className={styles.photoCard}>
          <div className={styles.photoImageWrap}>
            <Image
              src={photo.thumbnailUrl}
              alt={alt}
              fill
              className={styles.photoImage}
              sizes="(max-width: 900px) 100vw, (max-width: 1320px) 50vw, 22rem"
              unoptimized={shouldBypassNextImageOptimization(photo.thumbnailUrl)}
            />
          </div>
          <div className={styles.photoMeta}>
            <span className={styles.photoLabel}>{label}</span>
          </div>
        </article>
      }
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
    <section className={`${workspaceStyles.card} ${styles.sectionCard}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBlock}>
          <span className={styles.sectionEyebrow}>
            {section.kind === "cluster"
              ? `Cluster ${String(index + 1).padStart(2, "0")}`
              : "Remaining"}
          </span>
          <h3 className={styles.sectionTitle}>{title}</h3>
        </div>

        <div className={styles.sectionBadges}>
          <span className={styles.metaBadge}>{section.photoCount} photos</span>
        </div>
      </div>

      {section.photos.length > 0 ? (
        <div className={styles.photoGrid}>
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
        <div className={styles.emptySection}>
          <strong className={styles.emptyTitle}>No photo assets resolved</strong>
          <p className={styles.emptyBody}>
            This cluster exists in the moderation payload, but no photo assets were
            attached to it.
          </p>
        </div>
      )}
    </section>
  );
}

function EmptyEvidenceCard({ detail }: { detail: AdminReviewDetail }) {
  return (
    <section className={`${workspaceStyles.card} ${styles.sectionCard}`}>
      <div className={styles.emptySection}>
        <strong className={styles.emptyTitle}>No evidence photos available</strong>
        <p className={styles.emptyBody}>
          {detail.evidence.unavailableReason ??
            "The admin detail contract did not return any photo evidence for this journey."}
        </p>
      </div>
    </section>
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
    <section className={`${workspaceStyles.card} ${styles.heroCard}`}>
      <div className={styles.heroTopRow}>
        <Link href={backHref} className={workspaceStyles.secondaryButton}>
          Back to reviews
        </Link>

        <div className={styles.heroBadges}>
          <span className={buildStatusClassName(detail.journey.review.status)}>
            {getAdminReviewStatusLabel(detail.journey.review.status)}
          </span>
        </div>
      </div>

      <div className={styles.heroCopy}>
        <span className={styles.heroEyebrow}>Journey</span>
        <h1 className={styles.heroTitle}>
          {detail.journey.title || "Untitled journey"}
        </h1>
        {detail.journey.description ? (
          <p className={styles.heroDescription}>{detail.journey.description}</p>
        ) : null}
      </div>
    </section>
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
    <section className={`${workspaceStyles.card} ${styles.panel} ${styles.stickyPanel}`}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Review status</h3>
        {reviewMutation ? (
          <div className={styles.inlineStatus}>
            <span className={buildStatusClassName(reviewMutation.reviewStatus)}>
              {getAdminReviewStatusLabel(reviewMutation.reviewStatus)}
            </span>
          </div>
        ) : null}
      </div>

      <form action={updatePublishedJourneyReviewAction} className={workspaceStyles.formCard}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="targetPublicId" value={effectiveTargetPublicId} />

        <fieldset className={workspaceStyles.statusFieldset}>
          <legend className={workspaceStyles.fieldLabel}>Review status</legend>
          <div className={styles.radioGrid}>
            {(
              [
                ["PENDING", "Pending"],
                ["APPROVED", "Approved"],
                ["REJECTED", "Rejected"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={styles.radioOption}>
                <input
                  type="radio"
                  name="reviewStatus"
                  value={value}
                  defaultChecked={defaultReviewStatus === value}
                  className={styles.radioInput}
                />
                <span className={styles.radioCard}>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button type="submit" className={workspaceStyles.primaryButton}>
            Save
          </button>
        </div>
      </form>
    </section>
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
    <main className={workspaceStyles.page}>
      <div className={workspaceStyles.shell}>
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

        <section className={workspaceStyles.content}>
          <PageHeader
            banner={banner}
            pendingCount={queue.summary.pendingCount}
          />

          <div className={styles.layout}>
            <div className={styles.mainColumn}>
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

            <aside className={styles.sideColumn}>
              <ReviewUpdatePanel
                detail={detail}
                reviewMutation={reviewMutation}
                returnTo={returnTo}
                targetPublicId={targetPublicId}
              />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
