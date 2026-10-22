// ──────────────────────────────────────────────
// User Admin API types — hand-written from NestJS contract (apps/core/src/users)
// ──────────────────────────────────────────────

export type AdminUserStatusAction = "banned" | "active";

export interface UpdateAdminUserStatusDto {
  status: AdminUserStatusAction;
  reason?: string;
  /** Report this decision answers; the API rejects an unknown id (INVALID_REPORT_REFERENCE). */
  reportId?: string;
}

/** `inactive`: the ban was lifted but the account still owes required
 * consents, so it stays inactive until it accepts them. */
export type AdminUserStatusResult = "banned" | "active" | "inactive";

export interface AdminUserStatusResponseDataDto {
  userId: string;
  status: AdminUserStatusResult;
}

// ─── Operator surfaces (mirror docs/openapi/core.json) ───

export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
export type AdminUserRole = "ADMIN" | "USER";
export type AdminUserProvider = "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY";

export interface AdminUserListItemDto {
  userId: string;
  name: string | null;
  email: string | null;
  providerEmail: string | null;
  picture: string | null;
  provider: AdminUserProvider;
  status: AdminUserStatus;
  role: AdminUserRole;
  createdAt: string;
  publishedJourneyCount: number;
}

export interface AdminUsersDataDto {
  users: AdminUserListItemDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export type AdminUserAuthEventType =
  | "LOGIN"
  | "LOGOUT"
  | "ENROLL"
  | "REVOKE"
  | "LINK"
  | "RATE_LIMITED"
  | "VERIFY_FAILED";

export interface AdminUserAuthEventDto {
  id: string;
  eventType: AdminUserAuthEventType;
  result: "SUCCESS" | "FAILURE";
  provider: string | null;
  failureReason: string | null;
  ip: string | null;
  userAgent: string | null;
  platform: string | null;
  createdAt: string;
}

export interface AdminUserAuthEventsDataDto {
  events: AdminUserAuthEventDto[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminUserProfileDto {
  userId: string;
  name: string | null;
  picture: string | null;
  biography: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  providerEmail: string | null;
  provider: AdminUserProvider;
  status: AdminUserStatus;
  role: AdminUserRole;
  preferredLanguage: string | null;
  notificationEnabled: boolean;
  hasPushToken: boolean;
  createdAt: string;
  updatedAt: string;
  erasedAt: string | null;
  erasureDueAt: string | null;
}

export interface AdminUserIdentityDto {
  provider: AdminUserProvider;
  email: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface AdminUserPasskeyDto {
  deviceLabel: string | null;
  platform: string | null;
  deviceType: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface AdminUserSignInMethodsDto {
  identities: AdminUserIdentityDto[];
  passkeys: AdminUserPasskeyDto[];
}

export interface AdminUserDeviceCredentialDto {
  platform: "IOS" | "ANDROID";
  attestationLevel: "NONE" | "SOFTWARE" | "HARDWARE";
  status: "ACTIVE" | "REVOKED";
  deviceLabel: string | null;
  osVersion: string | null;
  appVersion: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface AdminUserCurrentSessionDto {
  createdAt: string;
  expiresAt: string;
  platform: string | null;
  userAgent: string | null;
  ip: string | null;
}

export interface AdminUserConsentDto {
  consentType: string;
  agreement: boolean;
  isRequired: boolean;
  createdAt: string;
}

export interface AdminUserCountsDto {
  publishedJourneys: number;
  privateJourneys: number;
  activeComments: number;
  likesGiven: number;
  followers: number;
  following: number;
  blocking: number;
  blockedBy: number;
  reportsReceived: number;
  reportsAgainstJourneys: number;
  reportsFiled: number;
}

export interface AdminUserDetailDataDto {
  profile: AdminUserProfileDto;
  signInMethods: AdminUserSignInMethodsDto;
  deviceCredentials: AdminUserDeviceCredentialDto[];
  currentSession: AdminUserCurrentSessionDto;
  consents: AdminUserConsentDto[];
  counts: AdminUserCountsDto;
}

export interface RevokeAdminUserSessionsDto {
  reason?: string;
}

export interface AdminUserSessionsRevokeDataDto {
  userId: string;
  revokedSessions: number;
}
