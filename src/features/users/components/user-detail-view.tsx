import { BackLink } from "@/components/back-link";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { DateValue } from "@/components/detail-parts";
import { FlashBanner } from "@/components/flash-banner";
import { ReasonField } from "@/components/reason-field";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import type { AdminUserProfileDto, AdminUserSubscriptionsDataDto } from "@/lib/api/types";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminUsersHref } from "@/lib/navigation/paths";
import { UserStatusForm } from "@/entities/user/components/user-status-form";
import { USER_STATUS_LABELS, USER_STATUS_TONES } from "@/entities/user/model";
import { revokeAdminUserSessionsAction } from "@/features/users/actions";
import type { AdminUserDetailWorkspaceData } from "@/features/users/loader";
import { UserAccountCard } from "./user-account-card";
import { UserActivityCard } from "./user-activity-card";
import { UserDeletionSection } from "./user-deletion-section";
import {
  AuthEventsSection,
  CommentsSection,
  JourneysSection,
  ModerationSection,
  ReportsSection,
} from "./user-history-sections";
import { UserSignInCard } from "./user-sign-in-card";
import { UserStorageSection } from "./user-storage-section";
import { UserSubscriptionSection } from "./user-subscription-section";

function displayName(profile: AdminUserProfileDto): string {
  return profile.name || (profile.erasedAt ? "Erased account" : "Unnamed user");
}

/** How the account is named in the confirmation dialogs. */
function dialogLabel(profile: AdminUserProfileDto): string {
  return profile.name || profile.email || profile.userId;
}

/** Why ban and sign-out are off, or `null`. The API refuses the same cases
 * (403 for the admin's own account and for admin accounts); a deleted
 * account (409) says so on its own button. */
function actionsBlockedReason(profile: AdminUserProfileDto, sessionUserId: string): string | null {
  if (profile.userId === sessionUserId) return "This is your account.";
  if (profile.role === "ADMIN") return "Admin accounts cannot be banned or signed out here.";
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
  const label = dialogLabel(profile);

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <UserStatusForm
          user={{ id: profile.userId, label, status: profile.status }}
          returnTo={returnTo}
          disabled={blockedReason !== null}
        />
        <ConfirmActionForm
          action={revokeAdminUserSessionsAction}
          fields={{ userId: profile.userId, returnTo }}
          triggerLabel="Sign out"
          disabled={blockedReason !== null || profile.status === "DELETED"}
          title={`Sign out ${label}?`}
          description={`Ends the current session of ${label} (${profile.userId}). The app must sign in again. The account is not banned.`}
          confirmLabel="Sign out"
        >
          <ReasonField id="user-sign-out-reason" />
        </ConfirmActionForm>
      </div>
      {blockedReason ? <p className="text-xs text-muted-foreground">{blockedReason}</p> : null}
    </div>
  );
}

export function UserDetailView({
  banner,
  data,
  subscriptions,
  returnTo,
  sessionUserId,
}: {
  banner: Flash | null;
  data: AdminUserDetailWorkspaceData;
  /** The account's storage subscriptions; `null` when they could not be loaded. */
  subscriptions: AdminUserSubscriptionsDataDto | null;
  returnTo: string;
  sessionUserId: string;
}) {
  const { profile } = data.detail;
  const userId = profile.userId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink href={buildAdminUsersHref()} label="Users" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-semibold tracking-tight">
                {displayName(profile)}
              </h1>
              <StatusBadge tone={USER_STATUS_TONES[profile.status] ?? "neutral"}>
                {USER_STATUS_LABELS[profile.status] ?? profile.status}
              </StatusBadge>
              {profile.role === "ADMIN" ? <Badge>Admin</Badge> : null}
            </div>
            <span className="break-all font-mono text-xs text-muted-foreground">{userId}</span>
            <span className="text-xs text-muted-foreground">
              Joined <DateValue value={profile.createdAt} />
            </span>
          </div>
          <AccountActions profile={profile} returnTo={returnTo} sessionUserId={sessionUserId} />
        </div>
        <FlashBanner flash={banner} />
      </div>

      {data.detail.deletion ? <UserDeletionSection deletion={data.detail.deletion} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <UserAccountCard detail={data.detail} />
        <UserSignInCard detail={data.detail} />
        <UserActivityCard counts={data.detail.counts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UserStorageSection
          storage={data.detail.storage}
          userId={userId}
          returnTo={returnTo}
          label={dialogLabel(profile)}
          disabledReason={profile.status === "DELETED" ? "Deleted account." : null}
        />
        <UserSubscriptionSection
          data={subscriptions}
          userId={userId}
          returnTo={returnTo}
          label={dialogLabel(profile)}
        />
        <ModerationSection data={data} userId={userId} />
        <ReportsSection data={data} userId={userId} />
        <JourneysSection data={data} userId={userId} />
        <CommentsSection data={data} userId={userId} />
        <AuthEventsSection data={data} />
      </div>
    </div>
  );
}
