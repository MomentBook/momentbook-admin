import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { StatusBadge } from "@/components/status-badge";
import { Time } from "@/components/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCount } from "@/lib/format/number";
import { toTimestamp } from "@/lib/format/time";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminCommentsHref, buildAdminUserHref } from "@/lib/navigation/paths";
import { buildAdminReportsHref } from "@/lib/navigation/report-routes";
import type { ReviewQueueTab } from "@/lib/navigation/review-routes";
import { getAdminReviewStatusLabel, REVIEW_STATUS_TONES } from "@/entities/journey/model";
import { ReportHistoryList } from "@/entities/report/components/report-history-list";
import type { ReportHistory } from "@/entities/report/model";
import { UserStatusForm } from "@/entities/user/components/user-status-form";
import {
  requeueJourneyReviewAction,
  updatePublishedJourneyReviewAction,
} from "@/features/reviews/actions";
import type { AdminReviewDetail, AdminReviewJourney } from "@/features/reviews/detail-model";
import type { AdminReviewBanner } from "@/features/reviews/flash";
import { ReviewDecisionForm } from "./review-decision-form";
import { ReviewEvidence } from "./review-evidence";
import { ReviewBanner } from "./review-flash-banner";

function JourneyHeader({ backHref, detail }: { backHref: string; detail: AdminReviewDetail }) {
  const { journey } = detail;

  return (
    <div className="flex flex-col gap-2">
      <BackLink href={backHref} label="Back to queue" />
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {journey.title || "Untitled journey"}
        </h1>
        <StatusBadge tone={REVIEW_STATUS_TONES[journey.review.status]}>
          {getAdminReviewStatusLabel(journey.review.status)}
        </StatusBadge>
      </div>
      {journey.description ? (
        <p className="text-sm text-muted-foreground">{journey.description}</p>
      ) : null}
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span className="font-mono">{journey.publicId}</span>
        {journey.publishedAt ? (
          <span>
            First published <Time value={journey.publishedAt} />
          </span>
        ) : null}
        <span>{formatCount(detail.evidence.loadedCount)} photos</span>
      </p>
    </div>
  );
}

/** Shown while a translation is pending or failed: retry it, or approve
 * the journey without it. */
function TranslationBox({ journey, returnTo }: { journey: AdminReviewJourney; returnTo: string }) {
  const { review } = journey;

  if (!review.localizationPending && !review.enqueueFailed) {
    return null;
  }

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="text-base">
          {review.enqueueFailed ? "Translation failed" : "Translation pending"}
        </CardTitle>
        <CardDescription>
          {review.enqueueFailed
            ? "Automatic translation gave up after retrying. Retry it, or approve without it."
            : "An approved journey goes public once its translation lands."}
          {toTimestamp(journey.updatedAt) !== null ? (
            <>
              {" "}
              Pending since <Time value={journey.updatedAt} withTime />.
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

function TranslationsDetails({ journey }: { journey: AdminReviewJourney }) {
  const entries = journey.localizedContent?.entries ?? [];

  return (
    <Card>
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="group -ml-2">
              Translations ({formatCount(entries.length)})
              <ChevronDownIcon className="transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ContextPanel({
  authorReports,
  journey,
  journeyReports,
  returnTo,
}: {
  authorReports: ReportHistory;
  journey: AdminReviewJourney;
  journeyReports: ReportHistory;
  returnTo: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Context</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Author</span>
          <Link
            href={buildAdminUserHref(journey.userId)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {journey.authorName ?? "Unnamed"}
          </Link>
          <span className="break-all font-mono text-xs text-muted-foreground">
            {journey.userId}
          </span>
        </div>
        <Link
          href={buildAdminCommentsHref({ publicId: journey.publicId })}
          className="text-sm text-primary hover:underline"
        >
          Comments on this journey
        </Link>
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
        <UserStatusForm
          user={{ id: journey.userId, label: journey.authorName ?? journey.userId }}
          returnTo={returnTo}
          banLabel="Ban author"
        />
      </CardContent>
    </Card>
  );
}

/** One journey under review: its photos and text on the left, the decision
 * and what is known about it and its author on the right. */
export function ReviewDetailView({
  authorReports,
  backHref,
  banner,
  detail,
  journeyReports,
  queueStatus,
  returnTo,
}: {
  authorReports: ReportHistory;
  backHref: string;
  banner: AdminReviewBanner | Flash | null;
  detail: AdminReviewDetail;
  journeyReports: ReportHistory;
  /** The queue tab the admin came from (null outside the queue); "pending"
   * turns on auto-advance. */
  queueStatus: ReviewQueueTab | null;
  returnTo: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ReviewBanner banner={banner} returnTo={returnTo} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <JourneyHeader backHref={backHref} detail={detail} />
          <TranslationBox journey={detail.journey} returnTo={returnTo} />
          <ReviewEvidence evidence={detail.evidence} />
          <TranslationsDetails journey={detail.journey} />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:w-80 lg:shrink-0">
          <ReviewDecisionForm
            journey={detail.journey}
            queueStatus={queueStatus}
            returnTo={returnTo}
          />
          <ContextPanel
            authorReports={authorReports}
            journey={detail.journey}
            journeyReports={journeyReports}
            returnTo={returnTo}
          />
        </aside>
      </div>
    </div>
  );
}
