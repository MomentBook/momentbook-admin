import "server-only";

import { listAdminAuditLog } from "@/lib/api/audit";
import { listAdminComments } from "@/lib/api/comments";
import { listPublishedJourneys } from "@/lib/api/journeys";
import { getAdminUser, listAdminUserAuthEvents, listAdminUsers } from "@/lib/api/users";
import { loadReportHistoryOrNull } from "@/lib/admin/reports";
import { orNull } from "@/lib/admin/section-load";
import { ADMIN_USERS_PAGE_SIZE } from "@/lib/admin/users-shared";
import type {
  AdminAuditLogDataDto,
  AdminCommentsDataDto,
  AdminPublishedJourneysDataDto,
  AdminReportItemDto,
  AdminUserAuthEventsDataDto,
  AdminUserDetailDataDto,
  AdminUserListItemDto,
  AdminUserRole,
  AdminUserStatus,
} from "@/src/apis/types";

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
    limit: ADMIN_USERS_PAGE_SIZE,
  });

  return {
    users: list.users,
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
  reportsReceived: { items: AdminReportItemDto[]; total: number } | null;
  reportsFiled: { items: AdminReportItemDto[]; total: number } | null;
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
