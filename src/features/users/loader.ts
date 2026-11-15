import "server-only";

import { isBackendApiError } from "@/lib/api/client";
import { listAdminAuditLog } from "@/lib/api/audit";
import { listAdminComments } from "@/lib/api/comments";
import { listPublishedJourneys } from "@/lib/api/journeys";
import { getAdminUser, listAdminUserAuthEvents, listAdminUsers } from "@/lib/api/users";
import { loadReportHistoryOrNull } from "@/entities/report/history";
import type { ReportHistory } from "@/entities/report/model";
import { ADMIN_PAGE_SIZE } from "@/lib/workspace/list-page";
import { orNull } from "@/lib/workspace/section-load";
import type {
  AdminAuditLogDataDto,
  AdminCommentsDataDto,
  AdminPublishedJourneysDataDto,
  AdminUserAuthEventsDataDto,
  AdminUserDetailDataDto,
  AdminUserListItemDto,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSubscriptionsDataDto,
} from "@/lib/api/types";
import { loadAdminUserSubscriptionsOrNull } from "./subscriptions-loader";

export type AdminUsersFilters = {
  q?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
  page: number;
};

export type AdminUsersWorkspaceData = {
  users: AdminUserListItemDto[];
  total: number;
  page: number;
  pages: number;
};

export async function loadAdminUsersWorkspaceData(
  accessToken: string,
  filters: AdminUsersFilters,
): Promise<AdminUsersWorkspaceData> {
  const list = await listAdminUsers({
    accessToken,
    q: filters.q,
    status: filters.status,
    role: filters.role,
    page: filters.page,
    limit: ADMIN_PAGE_SIZE,
  });

  return {
    users: list.items,
    total: list.total,
    page: filters.page,
    pages: Math.max(1, list.pages),
  };
}

const MODERATION_LIMIT = 10;
const JOURNEYS_LIMIT = 5;
const COMMENTS_LIMIT = 5;
const AUTH_EVENTS_LIMIT = 10;

/** A `null` section failed to load; the page says so in that section. */
export type AdminUserDetailWorkspaceData = {
  detail: AdminUserDetailDataDto;
  moderation: AdminAuditLogDataDto | null;
  journeys: AdminPublishedJourneysDataDto | null;
  comments: AdminCommentsDataDto | null;
  reportsReceived: ReportHistory;
  reportsFiled: ReportHistory;
  authEvents: AdminUserAuthEventsDataDto | null;
};

/**
 * The user detail page. The profile is required, so its 404 propagates for
 * the page to redirect; the six sections load alongside it, in one round
 * trip, since they need only the id.
 */
export async function loadAdminUserDetailWorkspaceData(
  accessToken: string,
  userId: string,
): Promise<AdminUserDetailWorkspaceData> {
  const [detail, moderation, journeys, comments, reportsReceived, reportsFiled, authEvents] =
    await Promise.all([
      getAdminUser({ accessToken, userId }),
      orNull(
        listAdminAuditLog({
          accessToken,
          subjectUserId: userId,
          page: 1,
          limit: MODERATION_LIMIT,
        }),
      ),
      orNull(listPublishedJourneys({ accessToken, userId, page: 1, limit: JOURNEYS_LIMIT })),
      orNull(listAdminComments({ accessToken, userId, page: 1, limit: COMMENTS_LIMIT })),
      loadReportHistoryOrNull({ accessToken, targetType: "USER", targetId: userId }),
      loadReportHistoryOrNull({ accessToken, reporterId: userId }),
      orNull(
        listAdminUserAuthEvents({ accessToken, userId, page: 1, limit: AUTH_EVENTS_LIMIT }),
      ),
    ]);

  return { detail, moderation, journeys, comments, reportsReceived, reportsFiled, authEvents };
}

export type UserDetailPage = {
  detail: AdminUserDetailWorkspaceData;
  /** `null` when the subscriptions could not be loaded. */
  subscriptions: AdminUserSubscriptionsDataDto | null;
};

/** The user page: the account with its sections, and its subscriptions, in
 * one round trip. `null` when there is no such account (the API answers 404
 * for an unknown id and for one that is not a UUID). */
export async function loadUserDetailPage(
  accessToken: string,
  userId: string,
): Promise<UserDetailPage | null> {
  try {
    const [detail, subscriptions] = await Promise.all([
      loadAdminUserDetailWorkspaceData(accessToken, userId),
      loadAdminUserSubscriptionsOrNull(accessToken, userId),
    ]);

    return { detail, subscriptions };
  } catch (error) {
    if (isBackendApiError(error) && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
