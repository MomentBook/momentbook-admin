import Link from "next/link";
import { DateValue, Section, SectionNote } from "@/components/detail-parts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildAdminAuditLogHref, buildAdminCommentsHref } from "@/lib/navigation/paths";
import { buildAdminReportsHref } from "@/lib/navigation/report-routes";
import {
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
} from "@/lib/navigation/review-routes";
import { ADMIN_AUDIT_ACTION_LABELS } from "@/entities/audit-event/model";
import { COMMENT_DELETED_BY_LABELS } from "@/entities/comment/model";
import { getAdminReviewStatusLabel, normalizeAdminReviewItem } from "@/entities/journey/model";
import { ReportHistoryList } from "@/entities/report/components/report-history-list";
import { humanizeEnum } from "@/entities/user/model";
import type { AdminUserDetailWorkspaceData } from "@/features/users/loader";

// The account's recent history, one section per source. A section whose
// request failed (`null`) says so; the rest of the page stands.

type SectionProps = { data: AdminUserDetailWorkspaceData; userId: string };

function Unavailable({ what }: { what: string }) {
  return <SectionNote>Could not load {what}.</SectionNote>;
}

export function ModerationSection({ data, userId }: SectionProps) {
  const { moderation } = data;

  return (
    <Section
      title="Moderation history"
      total={moderation?.total ?? null}
      viewAllHref={buildAdminAuditLogHref({ subjectUserId: userId })}
    >
      {moderation === null ? (
        <Unavailable what="moderation history" />
      ) : moderation.items.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {moderation.items.map((action) => (
            <li key={action.id} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{ADMIN_AUDIT_ACTION_LABELS[action.action]}</Badge>
                <span className="text-xs text-muted-foreground">
                  <DateValue value={action.createdAt} withTime /> ·{" "}
                  {action.actor
                    ? action.actor.name ||
                      action.actor.email ||
                      action.actor.providerEmail ||
                      action.actor.id
                    : "Unknown admin"}
                </span>
              </span>
              {action.reason ? (
                <span className="whitespace-pre-wrap break-words text-xs">{action.reason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <SectionNote>No admin actions yet.</SectionNote>
      )}
    </Section>
  );
}

export function JourneysSection({ data, userId }: SectionProps) {
  const { journeys } = data;

  return (
    <Section
      title="Published journeys"
      total={journeys?.total ?? null}
      viewAllHref={buildAdminReviewQueueHref({ status: "all", userId })}
    >
      {journeys === null ? (
        <Unavailable what="journeys" />
      ) : journeys.items.length > 0 ? (
        <ul className="flex flex-col">
          {journeys.items.map(normalizeAdminReviewItem).map((journey) => (
            <li key={journey.publicId}>
              <Link
                href={buildAdminReviewDetailHref(journey.publicId)}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
              >
                <span className="min-w-0 truncate">{journey.title || "Untitled journey"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {getAdminReviewStatusLabel(journey.review.status)} ·{" "}
                  <DateValue value={journey.publishedAt} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <SectionNote>None.</SectionNote>
      )}
    </Section>
  );
}

export function CommentsSection({ data, userId }: SectionProps) {
  const { comments } = data;

  return (
    <Section
      title="Comments"
      total={comments?.total ?? null}
      // The section lists every status, so the full list must too.
      viewAllHref={buildAdminCommentsHref({ userId, status: "all" })}
    >
      {comments === null ? (
        <Unavailable what="comments" />
      ) : comments.items.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {comments.items.map((comment) => (
            <li key={comment.commentId} className="flex flex-col gap-0.5">
              <p className="line-clamp-2 whitespace-pre-wrap break-words">{comment.body}</p>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <DateValue value={comment.createdAt} />
                <Link
                  href={buildAdminReviewDetailHref(comment.publicId)}
                  className="font-mono text-primary hover:underline"
                >
                  {comment.publicId}
                </Link>
                {comment.status === "DELETED" ? (
                  <Badge variant="secondary">
                    Deleted
                    {comment.deletedByRole
                      ? ` by ${COMMENT_DELETED_BY_LABELS[comment.deletedByRole]}`
                      : ""}
                  </Badge>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <SectionNote>None.</SectionNote>
      )}
    </Section>
  );
}

export function ReportsSection({ data, userId }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reports</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ReportHistoryList
          title="Reports on this account"
          history={data.reportsReceived}
          viewAllHref={buildAdminReportsHref({ targetType: "USER", targetId: userId })}
        />
        <ReportHistoryList
          title="Reports filed by this account"
          history={data.reportsFiled}
          viewAllHref={buildAdminReportsHref({ reporterId: userId })}
        />
      </CardContent>
    </Card>
  );
}

export function AuthEventsSection({ data }: { data: AdminUserDetailWorkspaceData }) {
  const { authEvents } = data;

  return (
    <Section title="Recent sign-in events" total={authEvents?.total ?? null}>
      {authEvents === null ? (
        <Unavailable what="sign-in events" />
      ) : authEvents.items.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {authEvents.items.map((event) => (
            <li key={event.id} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-2">
                {humanizeEnum(event.eventType)}
                {event.result === "FAILURE" ? <Badge variant="destructive">Failed</Badge> : null}
                <span className="text-xs text-muted-foreground">
                  <DateValue value={event.createdAt} withTime />
                </span>
              </span>
              <span className="break-all text-xs text-muted-foreground">
                {[event.provider, event.platform, event.ip, event.failureReason]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <SectionNote>None in the last 180 days.</SectionNote>
      )}
    </Section>
  );
}
