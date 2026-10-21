import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { LocalizedDate, LocalizedDateTime } from "@/components/LocalizedTime";
import {
  requeueJourneyReviewAction,
  updatePublishedJourneyReviewAction,
} from "@/app/reviews/actions";
import { updateAdminUserStatusAction } from "@/app/reports/actions";
import { ReportHistoryList, type ReportHistory } from "@/app/reports/ReportHistoryList";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { buildAdminReportsHref } from "@/lib/admin/paths";
import type { ReviewQueueTab } from "@/lib/admin/review-queue";
import {
  getAdminReviewStatusLabel,
  type AdminReviewDetail,
  type AdminReviewEvidenceSection,
  type AdminReviewPhoto,
  type AdminReviewStatus,
} from "@/lib/admin/reviews";
import { defaultLanguage } from "@/lib/i18n/config";
import { ReviewBanner } from "../ReviewBanner";
import type { AdminReviewBanner } from "../review-banner";
import { LightboxPhotoTile } from "./LightboxPhotoTile";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type AdminReviewDetailPageViewProps = {
  backHref: string;
  banner: AdminReviewBanner | AdminDashboardBanner | null;
  detail: AdminReviewDetail;
  journeyReports: ReportHistory;
  authorReports: ReportHistory;
  /** The queue tab the admin came from; "pending" enables auto-advance. */
  queueStatus: ReviewQueueTab;
  returnTo: string;
};

function badgeVariantClass(status: AdminReviewStatus): "default" | "destructive" | "secondary" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
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

function JourneyHeader({ backHref, detail }: { backHref: string; detail: AdminReviewDetail }) {
  const { journey } = detail;

  return (
    <div className="flex flex-col gap-2">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href={backHref}>
          <ChevronLeft />
          Back to queue
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {journey.title || "Untitled journey"}
        </h1>
        <Badge variant={badgeVariantClass(journey.review.status)}>
          {getAdminReviewStatusLabel(journey.review.status)}
        </Badge>
      </div>
      {journey.description ? (
        <p className="text-sm text-muted-foreground">{journey.description}</p>
      ) : null}
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span className="font-mono">{journey.publicId}</span>
        {journey.publishedAt ? (
          <span>
            First published{" "}
            <LocalizedDate
              lang={ADMIN_DISPLAY_LANGUAGE}
              timestamp={Date.parse(journey.publishedAt)}
            />
          </span>
        ) : null}
        <span>{detail.evidence.loadedCount} photos</span>
      </p>
    </div>
  );
}

function TranslationBox({ detail, returnTo }: { detail: AdminReviewDetail; returnTo: string }) {
  const { journey } = detail;
  const { review } = journey;

  if (!review.localizationPending && !review.enqueueFailed) {
    return null;
  }

  const pendingSince = Date.parse(journey.updatedAt);

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-base">
          {review.enqueueFailed ? "Translation failed to enqueue" : "Translation pending"}
        </CardTitle>
        <CardDescription>
          {review.enqueueFailed
            ? "The translation job could not be queued. Retry it, or approve without it."
            : "An approved journey goes public once its translation lands."}
          {Number.isFinite(pendingSince) ? (
            <>
              {" "}
              Pending since{" "}
              <LocalizedDateTime lang={ADMIN_DISPLAY_LANGUAGE} timestamp={pendingSince} />.
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <form action={requeueJourneyReviewAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="targetPublicId" value={journey.publicId} />
          <Button type="submit" variant="outline" size="sm">
            Retry translation
          </Button>
        </form>
        {review.status !== "REJECTED" ? (
          <ConfirmActionForm
            action={updatePublishedJourneyReviewAction}
            fields={{
              returnTo,
              targetPublicId: journey.publicId,
              reviewStatus: "APPROVED",
              acceptUntranslated: "true",
              ...(journey.publishOperationId
                ? { publishOperationId: journey.publishOperationId }
                : {}),
            }}
            triggerLabel="Approve without translation"
            title="Approve without translation?"
            description="Publishes the original text to every language now and posts an audit message to Slack."
            confirmLabel="Approve without translation"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function TranslationsDetails({ detail }: { detail: AdminReviewDetail }) {
  const { journey } = detail;
  const entries = journey.localizedContent?.entries ?? [];

  return (
    <Card>
      <CardContent>
        <details>
          <summary className="cursor-pointer text-sm font-medium">
            Translations ({entries.length})
          </summary>
          <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Source language</dt>
            <dd>{journey.localizedContent?.sourceLanguage ?? "—"}</dd>
            <dt className="text-muted-foreground">Model</dt>
            <dd>{journey.localizationModel ?? "—"}</dd>
            <dt className="text-muted-foreground">Published without translation</dt>
            <dd>{journey.publishedWithoutTranslation ? "Yes" : "No"}</dd>
          </dl>
          {entries.length > 0 ? (
            <ul className="mt-3 flex flex-col">
              {entries.map((entry) => (
                <li key={entry.locale} className="border-t py-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {entry.locale} · {entry.languageName}
                  </p>
                  <p className="text-sm font-medium">{entry.title ?? "—"}</p>
                  {entry.description ? (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No translations yet.</p>
          )}
        </details>
      </CardContent>
    </Card>
  );
}

const DECISIONS = [
  { status: "APPROVED", label: "Approve", variant: "default" },
  { status: "REJECTED", label: "Reject", variant: "destructive" },
  { status: "PENDING", label: "Move to pending", variant: "outline" },
] as const;

function DecisionPanel({
  detail,
  queueStatus,
  returnTo,
}: {
  detail: AdminReviewDetail;
  queueStatus: ReviewQueueTab;
  returnTo: string;
}) {
  const { journey } = detail;
  const autoAdvance = queueStatus === "pending";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Decision</CardTitle>
        <CardDescription>
          {autoAdvance
            ? "Approve and Reject open the next pending journey."
            : "Decisions keep you on this journey."}{" "}
          You can change a decision here at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updatePublishedJourneyReviewAction} className="flex flex-col gap-3">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="targetPublicId" value={journey.publicId} />
          <input type="hidden" name="queueStatus" value={queueStatus} />
          {journey.publishOperationId ? (
            <input type="hidden" name="publishOperationId" value={journey.publishOperationId} />
          ) : null}
          <div className="grid gap-2">
            {DECISIONS.map((decision) => (
              <Button
                key={decision.status}
                type="submit"
                name="reviewStatus"
                value={decision.status}
                variant={decision.variant}
                disabled={journey.review.status === decision.status}
              >
                {decision.label}
              </Button>
            ))}
          </div>
          {autoAdvance ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="stay" value="1" className="size-4 accent-primary" />
              Stay on this journey
            </label>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function ContextPanel({
  authorReports,
  detail,
  journeyReports,
  returnTo,
}: {
  authorReports: ReportHistory;
  detail: AdminReviewDetail;
  journeyReports: ReportHistory;
  returnTo: string;
}) {
  const { journey } = detail;
  const authorLabel = journey.authorName ?? journey.userId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Context</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Author</span>
          <span className="text-sm font-medium">{journey.authorName ?? "Unnamed"}</span>
          <span className="break-all font-mono text-xs text-muted-foreground">
            {journey.userId}
          </span>
        </div>
        <ReportHistoryList
          title="Reports on this journey"
          history={journeyReports}
          viewAllHref={buildAdminReportsHref({
            targetType: "PUBLISHED_JOURNEY",
            targetId: journey.publicId,
          })}
        />
        <ReportHistoryList
          title="Reports on the author"
          history={authorReports}
          viewAllHref={buildAdminReportsHref({ targetType: "USER", targetId: journey.userId })}
        />
        <ConfirmActionForm
          action={updateAdminUserStatusAction}
          fields={{ userId: journey.userId, status: "banned", returnTo }}
          triggerLabel="Ban author"
          triggerVariant="destructive"
          title={`Ban ${authorLabel}?`}
          description={`Bans ${authorLabel} (${journey.userId}). All of their sessions are revoked immediately.`}
          confirmLabel="Ban author"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="ban-author-reason">Reason (optional)</Label>
            <Input id="ban-author-reason" name="reason" />
            <p className="text-xs text-muted-foreground">Sent to the API; not stored yet.</p>
          </div>
        </ConfirmActionForm>
      </CardContent>
    </Card>
  );
}

export function AdminReviewDetailPageView({
  authorReports,
  backHref,
  banner,
  detail,
  journeyReports,
  queueStatus,
  returnTo,
}: AdminReviewDetailPageViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ReviewBanner banner={banner} returnTo={returnTo} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <JourneyHeader backHref={backHref} detail={detail} />
          <TranslationBox detail={detail} returnTo={returnTo} />
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
          <TranslationsDetails detail={detail} />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:w-80 lg:shrink-0">
          <DecisionPanel detail={detail} queueStatus={queueStatus} returnTo={returnTo} />
          <ContextPanel
            authorReports={authorReports}
            detail={detail}
            journeyReports={journeyReports}
            returnTo={returnTo}
          />
        </aside>
      </div>
    </div>
  );
}
