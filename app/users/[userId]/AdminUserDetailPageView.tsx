import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { LocalizedDate, LocalizedDateTime } from "@/components/LocalizedTime";
import {
  buildAdminAuditLogHref,
  buildAdminCommentsHref,
  buildAdminReportsHref,
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
  buildAdminUsersHref,
} from "@/lib/admin/paths";
import { COMMENT_DELETED_BY_LABELS } from "@/lib/admin/comments-shared";
import { getAdminReviewStatusLabel, normalizeAdminReviewItem } from "@/lib/admin/reviews";
import type { AdminUserDetailWorkspaceData } from "@/lib/admin/users";
import { USER_STATUS_LABELS, userStatusBadgeVariant } from "@/lib/admin/users-shared";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminUserCountsDto, AdminUserProfileDto } from "@/src/apis/types";
import type { AdminDashboardBanner } from "@/app/_workspace/workspace-data";
import { updateAdminUserStatusAction } from "@/app/reports/actions";
import { ReportHistoryList } from "@/app/reports/ReportHistoryList";
import { revokeAdminUserSessionsAction } from "../actions";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

const ACTIVITY_COUNTS: ReadonlyArray<[keyof AdminUserCountsDto, string]> = [
  ["publishedJourneys", "Published journeys"],
  ["privateJourneys", "Private journeys"],
  ["activeComments", "Comments"],
  ["likesGiven", "Likes given"],
  ["followers", "Followers"],
  ["following", "Following"],
  ["blocking", "Blocking"],
  ["blockedBy", "Blocked by"],
  ["reportsReceived", "Reports on account"],
  ["reportsAgainstJourneys", "Reports on journeys"],
  ["reportsFiled", "Reports filed"],
];

/** `USER_SESSIONS_REVOKED` → "User sessions revoked". */
function humanizeEnum(value: string): string {
  const words = value.toLowerCase().replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function Placeholder() {
  return <span className="text-muted-foreground">—</span>;
}

function Text({ value }: { value: string | null | undefined }) {
  return value ? <span className="break-all">{value}</span> : <Placeholder />;
}

function DateValue({ value, withTime = false }: { value: string | null; withTime?: boolean }) {
  const timestamp = value ? Date.parse(value) : null;

  return withTime ? (
    <LocalizedDateTime lang={ADMIN_DISPLAY_LANGUAGE} timestamp={timestamp} fallback="—" />
  ) : (
    <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={timestamp} fallback="—" />
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function Unavailable({ what }: { what: string }) {
  return <p className="text-xs text-muted-foreground">Could not load {what}.</p>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

/** A history section; "View all" appears once there is something to see. */
function Section({
  title,
  total,
  viewAllHref,
  children,
}: {
  title: string;
  total: number | null;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {viewAllHref && total !== null && total > 0 ? (
          <CardAction>
            <Link href={viewAllHref} className="text-xs text-primary hover:underline">
              View all {total}
            </Link>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ReasonInput({ id }: { id: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Reason (optional)</Label>
      <Input id={id} name="reason" maxLength={1000} />
      <p className="text-xs text-muted-foreground">Saved in the audit log.</p>
    </div>
  );
}

function displayName(profile: AdminUserProfileDto): string {
  return profile.name || (profile.erasedAt ? "Erased account" : "Unnamed user");
}

/** Why the account actions are off, or `null` when they are available. The
 * API refuses the same cases (403 own/admin account, 409 deleted). */
function actionsBlockedReason(profile: AdminUserProfileDto, sessionUserId: string): string | null {
  if (profile.userId === sessionUserId) return "This is your account.";
  if (profile.role === "ADMIN") return "Admin accounts cannot be banned or signed out here.";
  if (profile.status === "DELETED") return "Deleted account.";
  return null;
}

function AccountActions({
  profile,
  returnTo,
  sessionUserId,
}: {
  profile: AdminUserProfileDto;
  returnTo: string;
  sessionUserId: string;
}) {
  const blockedReason = actionsBlockedReason(profile, sessionUserId);
  const disabled = blockedReason !== null;
  const label = profile.name || profile.email || profile.userId;
  const fields = { userId: profile.userId, returnTo };

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {profile.status === "BANNED" ? (
          <ConfirmActionForm
            action={updateAdminUserStatusAction}
            fields={{ ...fields, status: "active" }}
            triggerLabel="Unban"
            disabled={disabled}
            title={`Unban ${label}?`}
            description={`Lifts the ban on ${label} (${profile.userId}). If required consents are pending, the account stays inactive until it accepts them.`}
            confirmLabel="Unban"
          >
            <ReasonInput id="user-unban-reason" />
          </ConfirmActionForm>
        ) : (
          <ConfirmActionForm
            action={updateAdminUserStatusAction}
            fields={{ ...fields, status: "banned" }}
            triggerLabel="Ban"
            triggerVariant="destructive"
            disabled={disabled}
            title={`Ban ${label}?`}
            description={`Bans ${label} (${profile.userId}). All of their sessions are revoked immediately.`}
            confirmLabel="Ban"
          >
            <ReasonInput id="user-ban-reason" />
          </ConfirmActionForm>
        )}
        <ConfirmActionForm
          action={revokeAdminUserSessionsAction}
          fields={fields}
          triggerLabel="Sign out"
          disabled={disabled}
          title={`Sign out ${label}?`}
          description={`Ends the current session of ${label} (${profile.userId}). The app must sign in again. The account is not banned.`}
          confirmLabel="Sign out"
        >
          <ReasonInput id="user-sign-out-reason" />
        </ConfirmActionForm>
      </div>
      {blockedReason ? <p className="text-xs text-muted-foreground">{blockedReason}</p> : null}
    </div>
  );
}

function Header({
  banner,
  profile,
  returnTo,
  sessionUserId,
}: {
  banner: AdminDashboardBanner | null;
  profile: AdminUserProfileDto;
  returnTo: string;
  sessionUserId: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={buildAdminUsersHref()}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        &larr; Users
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-2xl font-semibold tracking-tight">
              {displayName(profile)}
            </h1>
            <Badge variant={userStatusBadgeVariant(profile.status)}>
              {USER_STATUS_LABELS[profile.status] ?? profile.status}
            </Badge>
            {profile.role === "ADMIN" ? <Badge>Admin</Badge> : null}
          </div>
          <span className="break-all font-mono text-xs text-muted-foreground">
            {profile.userId}
          </span>
          <span className="text-xs text-muted-foreground">
            Joined <DateValue value={profile.createdAt} />
          </span>
        </div>
        <AccountActions profile={profile} returnTo={returnTo} sessionUserId={sessionUserId} />
      </div>
      {banner ? (
        <Alert variant={banner.tone === "error" ? "destructive" : "default"}>
          <AlertTitle className="line-clamp-none">{banner.message}</AlertTitle>
        </Alert>
      ) : null}
    </div>
  );
}

function erasureText(profile: AdminUserProfileDto): ReactNode {
  if (profile.erasedAt) {
    return (
      <>
        Erased <DateValue value={profile.erasedAt} />
      </>
    );
  }

  if (profile.erasureDueAt) {
    return (
      <>
        Due <DateValue value={profile.erasureDueAt} />
      </>
    );
  }

  return <Placeholder />;
}

function AccountCard({ data }: { data: AdminUserDetailWorkspaceData }) {
  const { profile, consents } = data.detail;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Contact email">
            <Text value={profile.email} />
          </Field>
          <Field label="Email verified">
            {profile.emailVerifiedAt ? (
              <DateValue value={profile.emailVerifiedAt} />
            ) : (
              <span className="text-muted-foreground">Not verified</span>
            )}
          </Field>
          <Field label="Provider email">
            <Text value={profile.providerEmail} />
          </Field>
          <Field label="Provider">
            {profile.provider ? (
              <span className="capitalize">{profile.provider.toLowerCase()}</span>
            ) : (
              <Placeholder />
            )}
          </Field>
          <Field label="Language">
            <Text value={profile.preferredLanguage} />
          </Field>
          <Field label="Notifications">{profile.notificationEnabled ? "On" : "Off"}</Field>
          <Field label="Push token">{profile.hasPushToken ? "Registered" : "None"}</Field>
          <Field label="Erasure">{erasureText(profile)}</Field>
          <Field label="Updated">
            <DateValue value={profile.updatedAt} />
          </Field>
        </dl>
        {profile.biography ? (
          <Field label="Biography">
            <span className="whitespace-pre-wrap break-words">{profile.biography}</span>
          </Field>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Consents</h3>
          {consents.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {consents.map((consent) => (
                <li
                  key={`${consent.consentType}-${consent.createdAt}`}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="break-all">
                    {humanizeEnum(consent.consentType)}
                    {consent.isRequired ? null : (
                      <span className="text-xs text-muted-foreground"> (optional)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={consent.agreement ? "outline" : "secondary"}>
                      {consent.agreement ? "Agreed" : "Declined"}
                    </Badge>
                    <DateValue value={consent.createdAt} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No consents recorded.</Empty>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SignInCard({ data }: { data: AdminUserDetailWorkspaceData }) {
  const { currentSession, signInMethods, deviceCredentials } = data.detail;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign-in &amp; devices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Current session</h3>
          {currentSession ? (
            <dl className="grid grid-cols-2 gap-3">
              {/* The session row is replaced on every sign-in and refresh. */}
              <Field label="Signed in or refreshed">
                <DateValue value={currentSession.createdAt} withTime />
              </Field>
              <Field label="Expires">
                <DateValue value={currentSession.expiresAt} withTime />
              </Field>
              <Field label="Platform">
                <Text value={currentSession.platform} />
              </Field>
              <Field label="IP">
                <Text value={currentSession.ip} />
              </Field>
              <div className="col-span-2">
                <Field label="User agent">
                  <span className="break-all text-xs">{currentSession.userAgent ?? "—"}</span>
                </Field>
              </div>
            </dl>
          ) : (
            <Empty>No active session.</Empty>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Sign-in methods</h3>
          {signInMethods.identities.length + signInMethods.passkeys.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {signInMethods.identities.map((identity) => (
                <li
                  key={`identity-${identity.provider}-${identity.createdAt}`}
                  className="flex flex-col"
                >
                  <span>
                    <span className="capitalize">{identity.provider.toLowerCase()}</span>
                    {identity.email ? (
                      <span className="break-all text-muted-foreground"> · {identity.email}</span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Linked <DateValue value={identity.createdAt} /> · Last used{" "}
                    <DateValue value={identity.lastUsedAt} />
                  </span>
                </li>
              ))}
              {signInMethods.passkeys.map((passkey, index) => (
                <li key={`passkey-${passkey.createdAt}-${index}`} className="flex flex-col">
                  <span>
                    Passkey · {passkey.deviceLabel || passkey.deviceType}
                    {passkey.platform ? (
                      <span className="text-muted-foreground"> ({passkey.platform})</span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Added <DateValue value={passkey.createdAt} /> · Last used{" "}
                    <DateValue value={passkey.lastUsedAt} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>None.</Empty>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Device credentials</h3>
          {deviceCredentials.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {deviceCredentials.map((credential, index) => (
                <li key={`credential-${credential.createdAt}-${index}`} className="flex flex-col">
                  <span className="flex flex-wrap items-center gap-2">
                    {credential.deviceLabel || credential.platform}
                    <Badge variant="outline">{humanizeEnum(credential.attestationLevel)}</Badge>
                    {credential.status === "REVOKED" ? (
                      <Badge variant="secondary">Revoked</Badge>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[
                      credential.platform,
                      credential.osVersion,
                      credential.appVersion ? `app ${credential.appVersion}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Added <DateValue value={credential.createdAt} /> · Last used{" "}
                    <DateValue value={credential.lastUsedAt} />
                    {credential.revokedAt ? (
                      <>
                        {" "}
                        · Revoked <DateValue value={credential.revokedAt} />
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>None.</Empty>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ counts }: { counts: AdminUserCountsDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3">
          {ACTIVITY_COUNTS.map(([key, label]) => (
            <Field key={key} label={label}>
              <span className="tabular-nums">{counts[key]}</span>
            </Field>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ModerationSection({ data, userId }: { data: AdminUserDetailWorkspaceData; userId: string }) {
  const { moderation } = data;

  return (
    <Section
      title="Moderation history"
      total={moderation?.total ?? null}
      viewAllHref={buildAdminAuditLogHref({ subjectUserId: userId })}
    >
      {moderation === null ? (
        <Unavailable what="moderation history" />
      ) : moderation.actions.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {moderation.actions.map((action) => (
            <li key={action.id} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{humanizeEnum(action.action)}</Badge>
                <span className="text-xs text-muted-foreground">
                  <DateValue value={action.createdAt} withTime /> ·{" "}
                  {action.actor?.name || action.actor?.email || "Unknown admin"}
                </span>
              </span>
              {action.reason ? (
                <span className="whitespace-pre-wrap break-words text-xs">{action.reason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No admin actions yet.</Empty>
      )}
    </Section>
  );
}

function JourneysSection({ data, userId }: { data: AdminUserDetailWorkspaceData; userId: string }) {
  const { journeys } = data;

  return (
    <Section
      title="Published journeys"
      total={journeys?.total ?? null}
      viewAllHref={buildAdminReviewQueueHref({ status: "all", userId })}
    >
      {journeys === null ? (
        <Unavailable what="journeys" />
      ) : journeys.journeys.length > 0 ? (
        <ul className="flex flex-col">
          {journeys.journeys.map(normalizeAdminReviewItem).map((journey) => (
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
        <Empty>None.</Empty>
      )}
    </Section>
  );
}

function CommentsSection({ data, userId }: { data: AdminUserDetailWorkspaceData; userId: string }) {
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
      ) : comments.comments.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {comments.comments.map((comment) => (
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
        <Empty>None.</Empty>
      )}
    </Section>
  );
}

function ReportsSection({ data, userId }: { data: AdminUserDetailWorkspaceData; userId: string }) {
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

function AuthEventsSection({ data }: { data: AdminUserDetailWorkspaceData }) {
  const { authEvents } = data;

  return (
    <Section title="Recent sign-in events" total={authEvents?.total ?? null}>
      {authEvents === null ? (
        <Unavailable what="sign-in events" />
      ) : authEvents.events.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {authEvents.events.map((event) => (
            <li key={event.id} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-2">
                {humanizeEnum(event.eventType)}
                {event.result === "FAILURE" ? (
                  <Badge variant="destructive">Failed</Badge>
                ) : null}
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
        <Empty>None in the last 180 days.</Empty>
      )}
    </Section>
  );
}

export function AdminUserDetailPageView({
  banner,
  data,
  returnTo,
  sessionUserId,
}: {
  banner: AdminDashboardBanner | null;
  data: AdminUserDetailWorkspaceData;
  returnTo: string;
  sessionUserId: string;
}) {
  const { profile } = data.detail;

  return (
    <div className="flex flex-col gap-6">
      <Header
        banner={banner}
        profile={profile}
        returnTo={returnTo}
        sessionUserId={sessionUserId}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AccountCard data={data} />
        <SignInCard data={data} />
        <ActivityCard counts={data.detail.counts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ModerationSection data={data} userId={profile.userId} />
        <ReportsSection data={data} userId={profile.userId} />
        <JourneysSection data={data} userId={profile.userId} />
        <CommentsSection data={data} userId={profile.userId} />
        <AuthEventsSection data={data} />
      </div>
    </div>
  );
}
