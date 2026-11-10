/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Where the name came from. */
export enum PlaceNameSource {
  GOOGLE_PLACES = "GOOGLE_PLACES",
  REVERSE_GEOCODE = "REVERSE_GEOCODE",
  USER_INPUT = "USER_INPUT",
  AI_SUGGESTION = "AI_SUGGESTION",
}

export interface HealthDto {
  /**
   * Always `UP`: the process answered.
   * @example "UP"
   */
  status: "UP";
  /**
   * Server time of the check.
   * @format date-time
   * @example "2026-11-08T09:30:00.000Z"
   */
  checkedAt: string;
}

export interface ReadinessDto {
  /**
   * Always `UP`: every readiness check passed.
   * @example "UP"
   */
  status: "UP";
  /**
   * Always `UP`: the database answered the ping.
   * @example "UP"
   */
  database: "UP";
  /**
   * Server time of the check.
   * @format date-time
   * @example "2026-11-08T09:30:00.000Z"
   */
  checkedAt: string;
}

export interface ConsentStatusDto {
  /**
   * Whether every required consent item is agreed. Always `true` for guest sessions.
   * @example true
   */
  isAllRequiredConsented: boolean;
  /**
   * Keys of the required consent items not yet agreed (see `GET /core/consent-templates/signup`).
   * @example []
   */
  missingRequiredConsents: string[];
  /**
   * UI convenience flag, `!isAllRequiredConsented`: when `true`, send the user to the consent screen (`POST /core/users/consents`).
   * @example false
   */
  requiresAction: boolean;
}

export interface MyProfileDto {
  /**
   * Account id (UUID). For a guest session, the guest id.
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * How the account signs in. `ANONYMOUS` for a guest session; `null` when unknown.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY" | "ANONYMOUS" | null;
  /**
   * Display name; `null` when the account has none. A guest session without a name gets `게스트`.
   * @example "Jane Doe"
   */
  name: string | null;
  /**
   * The account's representative (contact) email; `null` when none is set.
   * @format email
   * @example "jane@example.com"
   */
  email: string | null;
  /**
   * Self-introduction; `null` when not set, and always for a guest session.
   * @example "Traveler and photographer"
   */
  biography: string | null;
  /**
   * Profile picture URL; `null` when there is none.
   * @format uri
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Whether this is a guest session rather than an account.
   * @example false
   */
  isGuest: boolean;
  /**
   * Account status. Guest sessions are always `ACTIVE`.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
  /**
   * When the account was created. For a guest session, the time of the request.
   * @format date-time
   * @example "2026-01-15T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the account was last updated. For a guest session, the time of the request.
   * @format date-time
   * @example "2026-03-02T12:00:00.000Z"
   */
  updatedAt: string;
  /** Required-consent status of the account. */
  consents: ConsentStatusDto;
}

export interface PictureUpdateDto {
  /**
   * What to do with the profile picture. `UPLOAD`: store the image in `value` (a base64 data URL) and use it. `REMOVE`: clear the picture (`value` is ignored). `SET_URL` (deprecated, no client uses it): keep the picture at `value`, which must be one this account uploaded — since every upload replaces the previous one, that is the current picture.
   * @example "UPLOAD"
   */
  action: "UPLOAD" | "REMOVE" | "SET_URL";
  /**
   * Required for `UPLOAD` and `SET_URL`, ignored for `REMOVE`. `UPLOAD`: a base64 data URL of a JPEG, PNG, GIF or WebP image (`data:image/<jpeg|jpg|png|gif|webp>;base64,…`). `SET_URL`: the MomentBook URL of a profile picture this account uploaded.
   * @example "data:image/webp;base64,UklGRhYAAABXRUJQVlA4IAoAAAAwAQCdASoBAAEAAAA="
   */
  value?: string;
}

export interface UpdateUserProfileDto {
  /**
   * New display name.
   * @example "Jane Doe"
   */
  name?: string;
  /**
   * Deprecated and ignored — the server never stores it. The representative email changes only through the OTP-verified `POST /auth/email/change/request` and `POST /auth/email/change/confirm` (ADR-0060). Still accepted for backward compatibility, but a malformed address is a 400.
   * @deprecated
   * @format email
   * @example "jane@example.com"
   */
  email?: string;
  /**
   * New self-introduction.
   * @example "Traveler and photographer"
   */
  biography?: string;
  /** Profile picture change. Omit it to keep the current picture; `{ "action": "REMOVE" }` clears it. */
  picture?: PictureUpdateDto;
}

export interface UserProfileDto {
  /**
   * Account id (UUID). For a guest session, the guest id.
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * How the account signs in. `ANONYMOUS` for a guest session; `null` when unknown.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY" | "ANONYMOUS" | null;
  /**
   * Display name; `null` when the account has none. A guest session without a name gets `게스트`.
   * @example "Jane Doe"
   */
  name: string | null;
  /**
   * The account's representative (contact) email; `null` when none is set.
   * @format email
   * @example "jane@example.com"
   */
  email: string | null;
  /**
   * Self-introduction; `null` when not set, and always for a guest session.
   * @example "Traveler and photographer"
   */
  biography: string | null;
  /**
   * Profile picture URL; `null` when there is none.
   * @format uri
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Whether this is a guest session rather than an account.
   * @example false
   */
  isGuest: boolean;
  /**
   * Account status. Guest sessions are always `ACTIVE`.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
  /**
   * When the account was created. For a guest session, the time of the request.
   * @format date-time
   * @example "2026-01-15T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the account was last updated. For a guest session, the time of the request.
   * @format date-time
   * @example "2026-03-02T12:00:00.000Z"
   */
  updatedAt: string;
}

export interface UserSummaryDto {
  /**
   * The member's user id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * Display name; `null` when the member has not set one (a chat shows `Anonymous` there).
   * @example "Alex Traveler"
   */
  name: string | null;
  /**
   * Profile picture URL; `null` when the member has none.
   * @format uri
   * @example "https://cdn.momentbook.app/users/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/profile.webp"
   */
  picture: string | null;
  /**
   * Short self-introduction (public profile text); `null` when the member has none.
   * @example "Slow travel, film camera, seaside cities."
   */
  biography: string | null;
}

export interface FollowingUserDto {
  /** The followed account; its `name` is `Anonymous` when it has none. */
  user: UserSummaryDto;
  /**
   * When the caller followed the account.
   * @format date-time
   * @example "2026-04-18T10:30:00.000Z"
   */
  followedAt: string;
}

export interface FollowingUserPageDto {
  /** Followed accounts on this page, most recently followed first. */
  items: FollowingUserDto[];
  /**
   * Number of followed accounts that are listed (active and not block-related).
   * @min 0
   * @example 12
   */
  total: number;
  /**
   * The page returned (after clamping).
   * @min 1
   * @example 1
   */
  page: number;
  /**
   * Items per page (after clamping).
   * @min 1
   * @example 20
   */
  limit: number;
}

export interface FollowStateDto {
  /**
   * The id that was checked, as sent.
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  followingUserId: string;
  /**
   * Whether the caller follows the account.
   * @example true
   */
  isFollowing: boolean;
  /**
   * When the caller followed the account (the original time when it already existed); `null` while not following.
   * @format date-time
   * @example "2026-04-19T10:30:00.000Z"
   */
  followedAt: string | null;
}

export interface BlockedUserDto {
  /** The blocked account; its `name` is `Unknown user` when it has none or no longer exists. */
  user: UserSummaryDto;
  /**
   * When the caller blocked the account.
   * @format date-time
   * @example "2026-04-09T10:30:00.000Z"
   */
  blockedAt: string;
}

export interface BlockedUserPageDto {
  /** Blocked accounts on this page, most recently blocked first. */
  items: BlockedUserDto[];
  /**
   * Total number of accounts the caller has blocked.
   * @min 0
   * @example 3
   */
  total: number;
  /**
   * The page returned (after clamping).
   * @min 1
   * @example 1
   */
  page: number;
  /**
   * Items per page (after clamping).
   * @min 1
   * @example 20
   */
  limit: number;
}

export interface BlockStatusDto {
  /**
   * Whether the caller has blocked the account.
   * @example true
   */
  isBlocked: boolean;
}

export interface AdminUserListItemDto {
  /**
   * Account id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  userId: string;
  /**
   * Display name; `null` when none.
   * @example "Alice"
   */
  name: string | null;
  /**
   * The account's representative email (ADR-0067); `null` when none.
   * @format email
   * @example "alice@example.com"
   */
  email: string | null;
  /**
   * Email synced from the OAuth provider; `null` when none. It may be an Apple private-relay address.
   * @example "alice@privaterelay.appleid.com"
   */
  providerEmail: string | null;
  /**
   * Profile picture exactly as stored (a storage key or a URL); `null` when none.
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Provider the account was created with; `null` when none.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY" | null;
  /**
   * Account status.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
  /**
   * Account role.
   * @example "USER"
   */
  role: "ADMIN" | "USER";
  /**
   * When the account was created.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * Number of journeys the account currently has published.
   * @example 12
   */
  publishedJourneyCount: number;
}

export interface AdminUserPageDto {
  /** The page of accounts. */
  items: AdminUserListItemDto[];
  /**
   * Accounts matching the filters.
   * @example 134
   */
  total: number;
  /**
   * Current page, 1-based.
   * @example 1
   */
  page: number;
  /**
   * Rows per page.
   * @example 20
   */
  limit: number;
}

export interface AdminUserAuthEventDto {
  /**
   * Event id.
   * @format uuid
   * @example "0199a1b2-9e0f-7a1b-8c2d-4e5f6a7b8c9d"
   */
  id: string;
  /**
   * What happened.
   * @example "LOGIN"
   */
  eventType:
    | "LOGIN"
    | "LOGOUT"
    | "ENROLL"
    | "REVOKE"
    | "LINK"
    | "RATE_LIMITED"
    | "VERIFY_FAILED";
  /**
   * Outcome.
   * @example "SUCCESS"
   */
  result: "SUCCESS" | "FAILURE";
  /**
   * Provider involved; `null` when none.
   * @example "GOOGLE"
   */
  provider: string | null;
  /**
   * Why it failed; `null` on success.
   * @example "invalid_code"
   */
  failureReason: string | null;
  /**
   * Client IP address; `null` when unknown.
   * @example "203.0.113.7"
   */
  ip: string | null;
  /**
   * Client user agent; `null` when unknown.
   * @example "MomentBook/2.4.48 (iOS 19.0)"
   */
  userAgent: string | null;
  /**
   * Client platform; `null` when unknown.
   * @example "ios"
   */
  platform: string | null;
  /**
   * When the event happened.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
}

export interface AdminUserAuthEventPageDto {
  /** The page of events, newest first. */
  items: AdminUserAuthEventDto[];
  /**
   * Events retained for this account.
   * @example 42
   */
  total: number;
  /**
   * Current page, 1-based.
   * @example 1
   */
  page: number;
  /**
   * Rows per page.
   * @example 20
   */
  limit: number;
}

export interface AdminUserProfileDto {
  /**
   * Account id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  userId: string;
  /**
   * Display name; `null` when none or erased.
   * @example "Alice"
   */
  name: string | null;
  /**
   * Profile picture exactly as stored (a storage key or a URL); `null` when none or erased.
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Biography; `null` when none or erased.
   * @example "Walking every city."
   */
  biography: string | null;
  /**
   * The account's representative email (ADR-0067); `null` when none or erased.
   * @format email
   * @example "alice@example.com"
   */
  email: string | null;
  /**
   * When the representative email was verified; `null` if never.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  emailVerifiedAt: string | null;
  /**
   * Email synced from the OAuth provider; `null` when none or erased. It may be an Apple private-relay address.
   * @example "alice@privaterelay.appleid.com"
   */
  providerEmail: string | null;
  /**
   * Provider the account was created with; `null` when none or erased.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY" | null;
  /**
   * Account status.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
  /**
   * Account role.
   * @example "USER"
   */
  role: "ADMIN" | "USER";
  /**
   * Preferred language code; `null` when unset.
   * @example "ko"
   */
  preferredLanguage: string | null;
  /**
   * Whether the account has push notifications enabled.
   * @example true
   */
  notificationEnabled: boolean;
  /**
   * Whether a push device is registered. Its token is never returned.
   * @example true
   */
  hasPushToken: boolean;
  /**
   * When the account was created.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the account was last updated.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  updatedAt: string;
  /**
   * When the final erasure of a deleted account completed (ADR-0089); `null` otherwise.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  erasedAt: string | null;
  /**
   * When the final erasure of a deleted account is due; `null` when not scheduled.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  erasureDueAt: string | null;
}

export interface AdminUserIdentityDto {
  /**
   * Sign-in provider.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY";
  /**
   * Email the provider reported; `null` when none.
   * @example "alice@example.com"
   */
  email: string | null;
  /**
   * When the identity was linked.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the identity last signed in; `null` if never recorded.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  lastUsedAt: string | null;
}

export interface AdminUserPasskeyDto {
  /**
   * Device label the user gave the passkey; `null` when none.
   * @example "iPhone 17"
   */
  deviceLabel: string | null;
  /**
   * Client platform; `null` when unknown.
   * @example "ios"
   */
  platform: string | null;
  /**
   * WebAuthn credential device type.
   * @example "multiDevice"
   */
  deviceType: string;
  /**
   * When the passkey was registered.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the passkey last signed in; `null` if never.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  lastUsedAt: string | null;
}

export interface AdminUserSignInMethodsDto {
  /** Linked sign-in identities. */
  identities: AdminUserIdentityDto[];
  /** Registered passkeys. Credential ids and keys are never returned. */
  passkeys: AdminUserPasskeyDto[];
}

export interface AdminUserDeviceCredentialDto {
  /**
   * Device platform.
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID";
  /**
   * Result of verifying the enrollment attestation.
   * @example "HARDWARE"
   */
  attestationLevel: "NONE" | "SOFTWARE" | "HARDWARE";
  /**
   * Credential status.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "REVOKED";
  /**
   * Device label; `null` when none.
   * @example "iPhone 17"
   */
  deviceLabel: string | null;
  /**
   * OS version at enrollment; `null` when none.
   * @example "19.0"
   */
  osVersion: string | null;
  /**
   * App version at enrollment; `null` when none.
   * @example "2.4.48"
   */
  appVersion: string | null;
  /**
   * When the credential was enrolled.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the credential last approved an action; `null` if never.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  lastUsedAt: string | null;
  /**
   * When the credential was revoked; `null` while active.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  revokedAt: string | null;
}

export interface AdminUserCurrentSessionDto {
  /**
   * When the session started: the last sign-in or token refresh.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /**
   * When the refresh token expires.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  expiresAt: string;
  /**
   * Client platform; `null` when unknown.
   * @example "ios"
   */
  platform: string | null;
  /**
   * Client user agent; `null` when unknown.
   * @example "MomentBook/2.4.48 (iOS 19.0)"
   */
  userAgent: string | null;
  /**
   * Client IP address; `null` when unknown.
   * @example "203.0.113.7"
   */
  ip: string | null;
}

export interface AdminUserConsentDto {
  /**
   * Consent type key.
   * @example "TERMS_OF_SERVICE"
   */
  consentType: string;
  /**
   * Whether the user agreed.
   * @example true
   */
  agreement: boolean;
  /**
   * Whether the consent is required.
   * @example true
   */
  isRequired: boolean;
  /**
   * When the consent was recorded.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
}

export interface AdminUserCountsDto {
  /**
   * Journeys currently published.
   * @example 12
   */
  publishedJourneys: number;
  /**
   * Active private journeys (count only, no content).
   * @example 30
   */
  privateJourneys: number;
  /**
   * Comments written by the account that are still active.
   * @example 4
   */
  activeComments: number;
  /**
   * Likes the account has given.
   * @example 58
   */
  likesGiven: number;
  /**
   * Accounts following this one.
   * @example 21
   */
  followers: number;
  /**
   * Accounts this one follows.
   * @example 17
   */
  following: number;
  /**
   * Accounts this one has blocked.
   * @example 1
   */
  blocking: number;
  /**
   * Accounts that have blocked this one.
   * @example 0
   */
  blockedBy: number;
  /**
   * Reports filed against this account.
   * @example 2
   */
  reportsReceived: number;
  /**
   * Reports filed against this account's published journeys.
   * @example 3
   */
  reportsAgainstJourneys: number;
  /**
   * Reports this account has filed.
   * @example 5
   */
  reportsFiled: number;
}

export interface AdminUserDetailDto {
  /** Account profile. */
  profile: AdminUserProfileDto;
  /** How the account can sign in. */
  signInMethods: AdminUserSignInMethodsDto;
  /** Device credentials. Device ids and keys are never returned. */
  deviceCredentials: AdminUserDeviceCredentialDto[];
  /** The one active session (an account has at most one), or `null` when signed out. Never carries the token. */
  currentSession: AdminUserCurrentSessionDto | null;
  /** Consents on file. */
  consents: AdminUserConsentDto[];
  /** Activity counts. */
  counts: AdminUserCountsDto;
}

export interface UpdateAdminUserStatusDto {
  /**
   * `BANNED` bans the account; `ACTIVE` lifts a ban.
   * @example "BANNED"
   */
  status: "BANNED" | "ACTIVE";
  /**
   * Free-text admin note on why (up to 1000 characters). Stored in the admin action log.
   * @maxLength 1000
   * @example "Repeated spam reports"
   */
  reason?: string;
  /**
   * Id (UUID) of the report this sanction answers. Must be a report about this user (a USER report on them, or a report on one of their published journeys), else 400 `INVALID_REPORT_REFERENCE`. Stored in the admin action log.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  reportId?: string;
}

export interface AdminUserStatusDto {
  /**
   * The target account id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  userId: string;
  /**
   * The account status now: `BANNED` after a ban; after an unban, `ACTIVE`, or `INACTIVE` when the account still owes required consents.
   * @example "BANNED"
   */
  status: "BANNED" | "ACTIVE" | "INACTIVE";
}

export interface RevokeAdminUserSessionsDto {
  /**
   * Free-text admin note on why (up to 1000 characters). Stored in the admin action log.
   * @maxLength 1000
   * @example "Lost phone, reported by the owner"
   */
  reason?: string;
}

export interface AdminUserSessionsRevokeResultDto {
  /**
   * The target account id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  userId: string;
  /**
   * Refresh tokens revoked. An account has at most one active session, so 0 or 1; access tokens already issued also stop working.
   * @example 1
   */
  revokedSessions: number;
}

export interface PublicUserProfileDto {
  /**
   * Account id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * Display name; `Anonymous` when the account has none.
   * @example "Jane Doe"
   */
  name: string | null;
  /**
   * Profile picture URL; `null` when there is none.
   * @format uri
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Self-introduction; `null` when there is none.
   * @example "Traveler and photographer"
   */
  biography: string | null;
  /**
   * Number of publicly visible journeys (approved and public); 0 when none.
   * @example 5
   */
  publishedJourneyCount: number;
}

export interface PublicMemoriesOverviewSummaryDto {
  /**
   * Number of publicly visible journeys (approved and public) of this account.
   * @example 5
   */
  publishedJourneyCount: number;
  /**
   * Number of distinct regions in `regions`.
   * @example 3
   */
  regionCount: number;
}

/** A point on the map (WGS 84 degrees). */
export interface LatLngDto {
  /**
   * Latitude in degrees.
   * @example 37.579617
   */
  lat: number;
  /**
   * Longitude in degrees.
   * @example 126.977041
   */
  lng: number;
}

export interface PublicMemoriesOverviewRegionDto {
  /**
   * Opaque region id (`place:…` or `label:…`); pass it as `regionId` to the journeys list.
   * @example "place:ChIJm7u-8H7raDURzR3JzA8pW4M"
   */
  regionId: string;
  /**
   * Display name of the region.
   * @example "Gyeongbokgung Palace"
   */
  name: string;
  /**
   * Number of this account's public journeys that visited the region.
   * @example 2
   */
  journeyCount: number;
  /**
   * Continent inferred from the region center; `null` when the region has no center coordinates.
   * @example "ASIA"
   */
  continent:
    | "ASIA"
    | "EUROPE"
    | "NORTH_AMERICA"
    | "SOUTH_AMERICA"
    | "AFRICA"
    | "OCEANIA"
    | "ANTARCTICA"
    | null;
  /** Average center of the region across journeys (6 decimal places), for map rendering; `null` when no coordinates are known. */
  center: LatLngDto | null;
}

export interface PublicMemoriesOverviewDto {
  /**
   * Account id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /** Summary counts. */
  summary: PublicMemoriesOverviewSummaryDto;
  /** Distinct regions visited by the public journeys, by journey count (descending) then name. */
  regions: PublicMemoriesOverviewRegionDto[];
}

/** The wall-clock time a moment happened at, where it happened — what the apps display instead of converting an epoch timestamp to the viewer's zone. Unknown values are explicit rather than guessed. Rules: `OFFSET_AWARE` needs `localDateTime` plus `utcOffsetMinutes` and/or `timeZoneId`; `FLOATING_LOCAL` needs `localDateTime` and no offset or zone; `UNKNOWN` carries none of the three. */
export interface LocalDateTimeContextDto {
  /**
   * Local wall-clock date and time without an offset (`YYYY-MM-DDTHH:mm:ss`, optional milliseconds); `null` when `localDateTimeType` is `UNKNOWN`.
   * @pattern ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$
   * @example "2026-03-30T18:20:00"
   */
  localDateTime: string | null;
  /**
   * UTC offset in minutes (−840 to 840) at that local time; `null` when unknown, and always for `FLOATING_LOCAL`.
   * @min -840
   * @max 840
   * @example 540
   */
  utcOffsetMinutes: number | null;
  /**
   * IANA time zone id; `null` when unknown, and always for `FLOATING_LOCAL`.
   * @example "Asia/Seoul"
   */
  timeZoneId: string | null;
  /**
   * `OFFSET_AWARE` — `localDateTime` plus an offset and/or time zone. `FLOATING_LOCAL` — a wall-clock time with no zone (offset and zone are `null`). `UNKNOWN` — nothing is known and every other field is `null`; show no local time rather than guessing.
   * @example "OFFSET_AWARE"
   */
  localDateTimeType: "OFFSET_AWARE" | "FLOATING_LOCAL" | "UNKNOWN";
}

export interface PublishedJourneySeoImageDto {
  /**
   * Image URL (display variant when available, else the full-size image).
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/variants/1759914000000-a1b2.display.webp"
   */
  url: string;
  /**
   * Width in pixels; `null` when unknown.
   * @example 1080
   */
  width: number | null;
  /**
   * Height in pixels; `null` when unknown.
   * @example 1920
   */
  height: number | null;
  /**
   * Alt text: the photo's place name; `null` when unknown.
   * @example "Seoul Station"
   */
  alt: string | null;
}

export interface PublishedJourneyLocalizationEntryDto {
  /**
   * BCP 47 locale of this translation.
   * @example "ja-JP"
   */
  locale: string;
  /**
   * Language code of the locale — what an `Accept-Language` header is matched against.
   * @example "ja"
   */
  languageCode: string;
  /**
   * Country code of the locale.
   * @example "JP"
   */
  countryCode: string;
  /**
   * English name of the language.
   * @example "Japanese"
   */
  languageName: string;
  /**
   * Translated title; `null` when there is none.
   * @example "ソウルの春の散歩"
   */
  title: string | null;
  /**
   * Translated description; `null` when there is none.
   * @example "漢江沿いのゆっくりとした夕暮れの光。"
   */
  description: string | null;
  /**
   * Hashtags in this language, derived from the title, description and impressions.
   * @example ["#ソウル旅行","#漢江"]
   */
  hashtags: string[];
}

export interface PublishedJourneyMomentTranslationDto {
  /**
   * BCP 47 locale of this translation.
   * @example "ja-JP"
   */
  locale: string;
  /**
   * Language code of the locale.
   * @example "ja"
   */
  languageCode: string;
  /**
   * Country code of the locale.
   * @example "JP"
   */
  countryCode: string;
  /**
   * English name of the language.
   * @example "Japanese"
   */
  languageName: string;
  /**
   * Translated impression; `null` when there is none.
   * @example "川沿いの空気が静かで心地よかった"
   */
  impression: string | null;
}

export interface PublishedJourneyMomentImpressionDto {
  /**
   * The moment these translations belong to (its `id`).
   * @example "3f2a1b0c-9d8e-4f7a-b6c5-d4e3f2a1b0c9"
   */
  momentId: string;
  /** One entry per translated locale. */
  translations: PublishedJourneyMomentTranslationDto[];
}

export interface PublishedJourneyLocalizedContentDto {
  /**
   * Language the translations were made from.
   * @example "ko"
   */
  sourceLanguage: string;
  /**
   * When the translations were produced.
   * @format date-time
   * @example "2026-03-28T10:15:00.000Z"
   */
  generatedAt: string;
  /** Title, description and hashtags per locale (`ko-KR`, `en-US`, `ja-JP`, `zh-CN`, `es-ES`, `pt-BR`, `fr-FR`, `th-TH`, `vi-VN`). */
  entries: PublishedJourneyLocalizationEntryDto[];
  /** Moment impressions per locale. */
  momentImpressions: PublishedJourneyMomentImpressionDto[];
}

export interface PublishedJourneyMetadataDto {
  /**
   * Title in the response language (source language when no translation applies); `null` when the author wrote none.
   * @example "Spring evening in Seoul"
   */
  title: string | null;
  /**
   * Description in the response language (source language when no translation applies); `null` when the author wrote none.
   * @example "A slow walk along the river at dusk."
   */
  description: string | null;
  /**
   * Hashtags, each starting with `#`, in the response language — for a translation, 3–6 lower-case words taken from the translated title and description. `[]` when there are none.
   * @example ["#spring","#evening","#seoul"]
   */
  hashtags: string[];
  /**
   * Language the author wrote the title and description in (`ko`, `en`, …); `null` when the app did not record it.
   * @example "ko"
   */
  sourceLanguage: string | null;
  /**
   * URL of the cover photo chosen at publish time; `null` when no cover was chosen.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/variants/1759914000000-a1b2.display.webp"
   */
  thumbnailUri: string | null;
  /** Every stored translation; `null` until the translation lands. Prefer the already-applied `title`, `description` and `hashtags` above. */
  localizedContent: PublishedJourneyLocalizedContentDto | null;
}

export interface PublicReviewDto {
  /**
   * The admin decision on the current snapshot: `PENDING` (waiting for review), `APPROVED` or `REJECTED`.
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface PublishedJourneySummaryDto {
  /**
   * Public id of the published journey (12 URL-safe characters) — the id the public journey pages and share links use.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's private journey id the publication was made from — non-null only when the signed-in viewer is the author.
   * @format uuid
   * @example "3f2b8c1e-9a4d-4e7b-8c6f-1d2e3a4b5c6d"
   */
  journeyId: string | null;
  /**
   * User id of the author.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /**
   * When the journey started.
   * @format date-time
   * @example "2026-10-07T09:00:00.000Z"
   */
  startedAt: string;
  /**
   * When the journey ended; `null` when it has no end time.
   * @format date-time
   * @example "2026-10-08T09:00:00.000Z"
   */
  endedAt: string | null;
  /** Local wall-clock context of `startedAt` for display (`UNKNOWN` when not known). */
  startedAtLocal: LocalDateTimeContextDto;
  /** Local wall-clock context of `endedAt`; `null` exactly when `endedAt` is. */
  endedAtLocal: LocalDateTimeContextDto | null;
  /**
   * Number of published photos.
   * @min 0
   * @example 12
   */
  photoCount: number;
  /**
   * Preview image URL: the cover photo's thumbnail variant (falling back to its display or full-size image), else the first photo's; `null` when the journey has no image.
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/variants/1759914000000-a1b2.display.webp"
   */
  thumbnailUrl: string | null;
  /** Up to three representative images (cover first) for link previews and web metadata; `[]` when there are none. */
  seoImages: PublishedJourneySeoImageDto[];
  /** The journey's text with the response language applied. */
  metadata: PublishedJourneyMetadataDto;
  /**
   * When the journey was first published (a republish keeps it); `null` when not recorded.
   * @format date-time
   * @example "2026-10-07T12:00:00.000Z"
   */
  publishedAt: string | null;
  /**
   * When the published journey record was created.
   * @format date-time
   * @example "2026-10-07T11:58:30.000Z"
   */
  createdAt: string;
  /**
   * When the published journey record last changed (republish, review, translation); `null` when not recorded. Prefer it as a web sitemap `lastmod`.
   * @format date-time
   * @example "2026-10-07T12:05:00.000Z"
   */
  updatedAt: string | null;
  /** Review state. */
  review: PublicReviewDto;
  /**
   * Moderation visibility: `PUBLIC`, or `HIDDEN` after a moderation action.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /**
   * How the item should be rendered: `AVAILABLE`, `REPORTED_HIDDEN`, `REVIEW_PENDING` or `REVIEW_REJECTED`.
   * @example "AVAILABLE"
   */
  contentStatus:
    | "AVAILABLE"
    | "REPORTED_HIDDEN"
    | "REVIEW_PENDING"
    | "REVIEW_REJECTED";
}

/** One page of a creator's journeys. */
export interface PublishedJourneyPageDto {
  /** The journeys of this page. */
  items: PublishedJourneySummaryDto[];
  /**
   * Number of journeys matching the request across all pages.
   * @min 0
   * @example 132
   */
  total: number;
  /**
   * Current page.
   * @min 1
   * @example 1
   */
  page: number;
  /**
   * The page size applied.
   * @min 1
   * @example 20
   */
  limit: number;
}

/** The public feed. One route serves the numbered pages and the cursor walk, so it carries both sets of keys (ADR-0099 §3). */
export interface PublishedJourneyFeedDto {
  /** The journeys of this page or batch. */
  items: PublishedJourneySummaryDto[];
  /**
   * Cursor of the next batch: set for `sort=RECENT` (offset or cursor mode) while more journeys follow — send it as `cursor`. `null` otherwise.
   * @example "eyJzb3J0QXQiOiIyMDI2LTA0LTAzVDA3OjAwOjAwLjAwMFoiLCJpZCI6IjAxOTYwMjNjLTVhMWItN2MyZC04ZTNmLTRhNWI2YzdkOGU5ZiJ9"
   */
  nextCursor: string | null;
  /**
   * The seed applied to a `sort=DISCOVERY` page; resend it as `discoverySeed` for later pages. `null` for other sorts.
   * @example "V1StGXR8_Z5j"
   */
  discoverySeed: string | null;
  /**
   * Number of journeys matching the request across all pages.
   * @min 0
   * @example 132
   */
  total: number;
  /**
   * Current page (offset paging); `null` in cursor mode.
   * @min 1
   * @example 1
   */
  page: number | null;
  /**
   * The page or batch size applied.
   * @min 1
   * @example 20
   */
  limit: number;
}

/** A photo's capture-time context: a local-time context plus where its zone information came from. Rules: `OFFSET_AWARE` needs `localDateTime` plus `utcOffsetMinutes` and/or `timeZoneId`; `FLOATING_LOCAL` needs `localDateTime` and no offset or zone; `UNKNOWN` carries none of the three. In addition, `UNKNOWN` requires `timeZoneSource: UNKNOWN`, `EXIF_EXPLICIT_OFFSET` requires `utcOffsetMinutes`, and `GPS_DERIVED` requires `utcOffsetMinutes` or `timeZoneId`. */
export interface CaptureTimeContextDto {
  /**
   * Local wall-clock date and time without an offset (`YYYY-MM-DDTHH:mm:ss`, optional milliseconds); `null` when `localDateTimeType` is `UNKNOWN`.
   * @pattern ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$
   * @example "2026-03-30T18:20:00"
   */
  localDateTime: string | null;
  /**
   * UTC offset in minutes (−840 to 840) at that local time; `null` when unknown, and always for `FLOATING_LOCAL`.
   * @min -840
   * @max 840
   * @example 540
   */
  utcOffsetMinutes: number | null;
  /**
   * IANA time zone id; `null` when unknown, and always for `FLOATING_LOCAL`.
   * @example "Asia/Seoul"
   */
  timeZoneId: string | null;
  /**
   * `OFFSET_AWARE` — `localDateTime` plus an offset and/or time zone. `FLOATING_LOCAL` — a wall-clock time with no zone (offset and zone are `null`). `UNKNOWN` — nothing is known and every other field is `null`; show no local time rather than guessing.
   * @example "OFFSET_AWARE"
   */
  localDateTimeType: "OFFSET_AWARE" | "FLOATING_LOCAL" | "UNKNOWN";
  /**
   * Where the zone or offset came from: the photo EXIF offset (`EXIF_EXPLICIT_OFFSET`), the GPS position (`GPS_DERIVED`), the user (`USER_INPUT`), or nowhere (`UNKNOWN`).
   * @example "EXIF_EXPLICIT_OFFSET"
   */
  timeZoneSource:
    | "EXIF_EXPLICIT_OFFSET"
    | "GPS_DERIVED"
    | "USER_INPUT"
    | "UNKNOWN";
}

/** One published photo: public CDN URLs plus what the recap knew about it. */
export interface PublishedJourneyImageDto {
  /**
   * Public photo id, stable for the publication: the owner's private `photoId` when it is URL-safe (`[A-Za-z0-9_-]+`), else an id derived from the image URL. A moment's `photoIds` reference it, and `GET /core/journeys/public/photos/{photoId}` looks it up.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Same value as `fullUrl`.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  url: string;
  /**
   * Public CDN URL of the full-size published image.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  fullUrl: string;
  /**
   * Public URL of the display-size variant; the same as `fullUrl` when no variant exists.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  displayUrl: string;
  /**
   * Public URL of the thumbnail variant; the same as `fullUrl` when no variant exists.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  thumbnailUrl: string;
  /**
   * Image width in pixels; `null` when unknown.
   * @example 1080
   */
  width: number | null;
  /**
   * Image height in pixels; `null` when unknown.
   * @example 1920
   */
  height: number | null;
  /**
   * Capture time; `null` when unknown.
   * @format date-time
   * @example "2026-03-30T09:20:00.000Z"
   */
  takenAt: string | null;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Display name of the recap moment that holds the photo; `null` when the recap named none.
   * @example "Gyeongbokgung Palace"
   */
  locationName: string | null;
  /** The photo's capture-time context; `localDateTimeType: UNKNOWN` when nothing is known. */
  captureTime: CaptureTimeContextDto;
}

/** One moment of the published recap, ready to render: its time, place, impression and photos. */
export interface PublishedMomentDto {
  /**
   * Moment id, the recap timeline id. The web page of a moment is `/journeys/{publicId}/moments/{id}`.
   * @example "3f2a1b0c-9d8e-4f7a-b6c5-d4e3f2a1b0c9"
   */
  id: string;
  /**
   * Moment kind. Every photo-only recap currently yields `ORPHAN`; `STOP` and `MOVE` are reserved.
   * @example "ORPHAN"
   */
  type: "STOP" | "MOVE" | "ORPHAN";
  /**
   * When the moment started.
   * @format date-time
   * @example "2026-03-30T09:00:00.000Z"
   */
  startAt: string;
  /**
   * When the moment ended.
   * @format date-time
   * @example "2026-03-30T11:00:00.000Z"
   */
  endAt: string;
  /**
   * Duration in milliseconds.
   * @example 7200000
   */
  durationMs: number;
  /** Local display context of `startAt` (falls back to the context its photos agree on); `UNKNOWN` rather than guessed. */
  startLocal: LocalDateTimeContextDto;
  /** Local display context of `endAt` (falls back to the context its photos agree on); `UNKNOWN` rather than guessed. */
  endLocal: LocalDateTimeContextDto;
  /** Center coordinates; `null` when the moment has no location. */
  center: LatLngDto | null;
  /**
   * Place name of the moment; `null` when not known.
   * @example "Gyeongbokgung Palace"
   */
  locationName: string | null;
  /**
   * The owner's impression of this moment, in the response language when a translation exists; `null` when there is none.
   * @example "The air by the river was calm and lovely."
   */
  impression: string | null;
  /**
   * Public photo ids of this moment in display order; each references `images[].photoId`.
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  photoIds: string[];
  /** The photos of this moment, in `photoIds` order (ids without an image are skipped). */
  photos: PublishedJourneyImageDto[];
}

/** A published journey for the viewer. When it is available (`contentStatus: AVAILABLE`) every field is filled; for a journey in review, rejected or hidden by moderation it is a status-focused payload — header fields, `contentStatus` and `notice`, with no images or moments. */
export interface PublishedJourneyDetailDto {
  /**
   * Public id of the publication (12 characters, URL-safe).
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's private journey id — the key of the owner routes (`/core/journeys/publish/{journeyId}`). `null` unless the signed-in viewer is the author.
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string | null;
  /**
   * The author's account id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /** The author's public profile. */
  author: UserSummaryDto;
  /**
   * When the journey started.
   * @format date-time
   * @example "2026-03-30T09:00:00.000Z"
   */
  startedAt: string;
  /**
   * When the journey ended; `null` for an open-ended journey.
   * @format date-time
   * @example "2026-03-31T09:00:00.000Z"
   */
  endedAt: string | null;
  /** Local display context of `startedAt` (`UNKNOWN` rather than guessed). */
  startedAtLocal: LocalDateTimeContextDto;
  /** Local display context of `endedAt`; `null` when `endedAt` is. */
  endedAtLocal: LocalDateTimeContextDto | null;
  /**
   * Title, in the response language when a translation exists, else the original; `null` when the author wrote none.
   * @example "A spring walk in Seoul"
   */
  title: string | null;
  /**
   * Description, in the response language when a translation exists, else the original; `null` when the author wrote none.
   * @example "Slow evening light along the Han River."
   */
  description: string | null;
  /**
   * Hashtags, each starting with `#`, in the response language, else the source language; `[]` until the translation lands and in a status-focused payload.
   * @example ["#spring","#seoul"]
   */
  hashtags: string[];
  /**
   * Preview image URL: the cover (thumbnail or display variant when available), else the first photo; `null` when the journey has no image.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  thumbnailUrl: string | null;
  /**
   * Web URL of the journey page, for sharing; `null` when unset.
   * @format uri
   * @example "https://momentbook.app/journeys/V1StGXR8_Z5j"
   */
  shareUrl: string | null;
  /**
   * Number of published photos; 0 in a status-focused payload.
   * @min 0
   * @example 24
   */
  photoCount: number;
  /** Every published photo, keyed by `photoId`; `[]` in a status-focused payload. */
  images: PublishedJourneyImageDto[];
  /** The moments, ordered by start time; `[]` in a status-focused payload. */
  moments: PublishedMomentDto[];
  /** All translations, for clients that switch language locally; `null` until the translation lands, and in a status-focused payload. */
  localizedContent: PublishedJourneyLocalizedContentDto | null;
  /** Up to three representative images (cover first) for web metadata and image sitemaps; `[]` in a status-focused payload. */
  seoImages: PublishedJourneySeoImageDto[];
  /**
   * First publish time (kept across republishes); `null` only on legacy rows.
   * @format date-time
   * @example "2026-03-31T02:11:45.000Z"
   */
  publishedAt: string | null;
  /**
   * When the publication record was created.
   * @format date-time
   * @example "2026-03-31T02:11:45.000Z"
   */
  createdAt: string;
  /**
   * Last change of the publication (republish, review, translation). Prefer it for sitemap `lastmod`.
   * @format date-time
   * @example "2026-04-01T09:00:00.000Z"
   */
  updatedAt: string;
  /** Review state of the current snapshot. */
  review: PublicReviewDto;
  /**
   * `AVAILABLE`: the full journey. `REVIEW_PENDING` / `REVIEW_REJECTED`: waiting for, or failed, admin review. `REPORTED_HIDDEN`: taken down after reports. Anything but `AVAILABLE` comes with `notice` and no content.
   * @example "AVAILABLE"
   */
  contentStatus:
    | "AVAILABLE"
    | "REPORTED_HIDDEN"
    | "REVIEW_PENDING"
    | "REVIEW_REJECTED";
  /**
   * Moderation visibility: `HIDDEN` once reports took it down.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /**
   * English explanation shown instead of the content; `null` when `contentStatus` is `AVAILABLE`.
   * @example "This journey is pending review and is not yet visible."
   */
  notice: string | null;
}

/** The published journey a photo belongs to. */
export interface PublishedPhotoJourneyDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's account id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /**
   * The author's private journey id; `null` unless the signed-in viewer is the author.
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string | null;
  /**
   * When the journey started.
   * @format date-time
   * @example "2026-03-30T09:00:00.000Z"
   */
  startedAt: string;
  /**
   * When the journey ended; `null` for an open-ended journey.
   * @format date-time
   * @example "2026-03-31T09:00:00.000Z"
   */
  endedAt: string | null;
  /** Local display context of `startedAt` (`UNKNOWN` rather than guessed). */
  startedAtLocal: LocalDateTimeContextDto;
  /** Local display context of `endedAt`; `null` when `endedAt` is. */
  endedAtLocal: LocalDateTimeContextDto | null;
  /** Title, description and hashtags of the journey, localized to the response language when a translation exists. */
  metadata: PublishedJourneyMetadataDto;
}

/** One published photo with the journey it belongs to. */
export interface PublishedPhotoDto {
  /**
   * Public photo id, stable for the publication: the owner's private `photoId` when it is URL-safe (`[A-Za-z0-9_-]+`), else an id derived from the image URL. A moment's `photoIds` reference it, and `GET /core/journeys/public/photos/{photoId}` looks it up.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Same value as `fullUrl`.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  url: string;
  /**
   * Public CDN URL of the full-size published image.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  fullUrl: string;
  /**
   * Public URL of the display-size variant; the same as `fullUrl` when no variant exists.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  displayUrl: string;
  /**
   * Public URL of the thumbnail variant; the same as `fullUrl` when no variant exists.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  thumbnailUrl: string;
  /**
   * Image width in pixels; `null` when unknown.
   * @example 1080
   */
  width: number | null;
  /**
   * Image height in pixels; `null` when unknown.
   * @example 1920
   */
  height: number | null;
  /**
   * Capture time; `null` when unknown.
   * @format date-time
   * @example "2026-03-30T09:20:00.000Z"
   */
  takenAt: string | null;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Display name of the recap moment that holds the photo; `null` when the recap named none.
   * @example "Gyeongbokgung Palace"
   */
  locationName: string | null;
  /** The photo's capture-time context; `localDateTimeType: UNKNOWN` when nothing is known. */
  captureTime: CaptureTimeContextDto;
  /** The journey this photo belongs to. */
  journey: PublishedPhotoJourneyDto;
}

export interface SignupConsentItemDto {
  /**
   * Unique item key; send it as `consentType` to `POST /core/users/consents`.
   * @example "terms"
   */
  key: string;
  /**
   * Display title of the item.
   * @example "Terms of Service"
   */
  label: string;
  /**
   * Web path of the document (e.g. `/terms`); join it with the MomentBook web host.
   * @example "/terms"
   */
  path: string;
  /**
   * Whether the item must be agreed before the account becomes active.
   * @example true
   */
  required: boolean;
  /**
   * Display order (ascending).
   * @example 1
   */
  order: number;
}

export interface SignupConsentsDto {
  /** Active consent items in display order. */
  consents: SignupConsentItemDto[];
  /**
   * Consent template version; send it back with `POST /core/users/consents`.
   * @example "1.0.0"
   */
  version: string;
}

export interface UserConsentItemUpdateDto {
  /**
   * Whether the user agrees to this item.
   * @example true
   */
  agreement: boolean;
  /**
   * Consent item key from `GET /core/consent-templates/signup` (e.g. terms, privacy, community-guidelines, marketing-consent). Unknown or inactive keys are ignored.
   * @example "terms"
   */
  consentType: string;
  /**
   * Ignored (kept for backward compatibility): the server stores the active template's text.
   * @example "I agree to the MomentBook Terms of Service."
   */
  content?: string;
  /**
   * Ignored (kept for backward compatibility): the server stores the active template's required flag.
   * @example true
   */
  isRequired?: boolean;
}

export interface UpdateUserConsentsDto {
  /**
   * One answer per consent item. An empty list stores nothing and just returns the current status.
   * @example [{"consentType":"terms","agreement":true},{"consentType":"privacy","agreement":true}]
   */
  consents: UserConsentItemUpdateDto[];
  /**
   * The `version` returned by `GET /core/consent-templates/signup`. A stale version is accepted.
   * @example "1.0.0"
   */
  version: string;
}

export interface ConsentValidationDto {
  /**
   * Whether every required consent item is agreed. When `degraded` is `true` this is `true` by default, not a verified fact.
   * @example true
   */
  isAllRequiredConsented: boolean;
  /**
   * Keys of the required consent items not agreed yet.
   * @example []
   */
  missingRequiredConsents: string[];
  /**
   * `true` when the server could not verify consents (no active required templates, or the check failed). `isAllRequiredConsented` is then a fail-open default and the account was not activated.
   * @example false
   */
  degraded: boolean;
}

export interface CreateReportDto {
  /**
   * What is reported: an account or a published journey.
   * @example "PUBLISHED_JOURNEY"
   */
  targetType: "USER" | "PUBLISHED_JOURNEY";
  /**
   * The reported target: the account id (UUID) when `targetType` is `USER`, the journey `publicId` when it is `PUBLISHED_JOURNEY`.
   * @example "V1StGXR8_Z5j"
   */
  targetId: string;
  /**
   * Why it is reported. `OTHER` requires a `description`.
   * @example "SPAM"
   */
  reason: "SPAM" | "ABUSE" | "HATE" | "SEXUAL" | "INAPPROPRIATE" | "OTHER";
  /**
   * Details from the reporter (trimmed; `null` or blank means none). Required when `reason` is `OTHER`; optional otherwise.
   * @example "This post is an advertisement."
   */
  description?: string | null;
}

export interface ReportDto {
  /**
   * Report id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * What was reported.
   * @example "PUBLISHED_JOURNEY"
   */
  targetType: "USER" | "PUBLISHED_JOURNEY";
  /**
   * The reported target: the account id (UUID) when `targetType` is `USER`, the journey `publicId` when it is `PUBLISHED_JOURNEY`.
   * @example "V1StGXR8_Z5j"
   */
  targetId: string;
  /**
   * Why it was reported.
   * @example "SPAM"
   */
  reason: "SPAM" | "ABUSE" | "HATE" | "SEXUAL" | "INAPPROPRIATE" | "OTHER";
  /**
   * `PENDING`, or `REJECTED` when the reported journey was already hidden.
   * @example "PENDING"
   */
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  /**
   * When the report was filed.
   * @format date-time
   * @example "2026-04-10T08:00:00.000Z"
   */
  createdAt: string;
}

/** An account as an admin sees it inside another resource: identity, both emails and status. */
export interface AdminUserSummaryDto {
  /**
   * Account id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  id: string;
  /**
   * Display name; `null` when none or erased.
   * @example "Alice"
   */
  name: string | null;
  /**
   * The account's representative email (ADR-0067, ownership verified by OTP); `null` when none.
   * @format email
   * @example "alice@example.com"
   */
  email: string | null;
  /**
   * Email synced from the OAuth provider (Google/Apple); `null` when none. It may be unverified or an Apple private-relay address (@privaterelay.appleid.com): a reference for abuse investigation, not the representative email.
   * @example "alice@privaterelay.appleid.com"
   */
  providerEmail: string | null;
  /**
   * Profile picture URL; `null` when none.
   * @format uri
   * @example "https://cdn.momentbook.app/users/0199a1b2/picture.webp"
   */
  picture: string | null;
  /**
   * Account status now.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "BANNED";
}

export interface AdminReportJourneyReviewDto {
  /**
   * Current publication review status of the journey.
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
  /**
   * Whether the review is approved (`status` is `APPROVED`).
   * @example true
   */
  approved: boolean;
}

export interface AdminReportPublishedJourneySummaryDto {
  /**
   * The journey's public id.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Id of the private journey it was published from.
   * @example "36a2d200-74d1-43ed-9265-8626b0eb2881"
   */
  journeyId: string;
  /**
   * The author's account id.
   * @format uuid
   * @example "0199a1b2-9e0f-7a1b-8c2d-4e5f6a7b8c9d"
   */
  userId: string;
  /**
   * Whether the journey is currently published.
   * @example true
   */
  published: boolean;
  /**
   * Current visibility: `HIDDEN` when hidden (for example by the automatic report hide).
   * @example "HIDDEN"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /** Current publication review state. */
  review: AdminReportJourneyReviewDto;
  /**
   * When the journey was published; `null` when unknown.
   * @format date-time
   * @example "2026-04-10T08:00:00.000Z"
   */
  publishedAt: string | null;
  /** The author's summary; `null` when the account no longer exists. */
  owner: AdminUserSummaryDto | null;
}

export interface AdminReportTargetCountsDto {
  /**
   * All reports on the same target.
   * @example 4
   */
  totalReports: number;
  /**
   * Reports on the same target that count toward the automatic hide (all but `REJECTED`).
   * @example 3
   */
  effectiveReports: number;
}

export interface AdminReportDto {
  /**
   * Report id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * Account id of the reporter.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  reporterId: string;
  /**
   * What was reported.
   * @example "PUBLISHED_JOURNEY"
   */
  targetType: "USER" | "PUBLISHED_JOURNEY";
  /**
   * The reported target: the account id (UUID) when `targetType` is `USER`, the journey `publicId` when it is `PUBLISHED_JOURNEY`.
   * @example "V1StGXR8_Z5j"
   */
  targetId: string;
  /**
   * Why it was reported.
   * @example "SPAM"
   */
  reason: "SPAM" | "ABUSE" | "HATE" | "SEXUAL" | "INAPPROPRIATE" | "OTHER";
  /**
   * The reporter's details; `null` when none were given.
   * @example "This post is an advertisement."
   */
  description: string | null;
  /**
   * Moderation status.
   * @example "PENDING"
   */
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  /**
   * Admin note; `null` when none.
   * @example "Reviewing together with similar reports."
   */
  adminNote: string | null;
  /**
   * When the report reached `RESOLVED`/`REJECTED`; `null` while it is open.
   * @format date-time
   * @example "2026-04-11T09:00:00.000Z"
   */
  resolvedAt: string | null;
  /**
   * Who closed the report: the admin account id, or `system:auto` for a report stored as `REJECTED` on filing; `null` while it is open.
   * @example "0199a1b2-9e0f-7a1b-8c2d-4e5f6a7b8c9d"
   */
  resolvedBy: string | null;
  /**
   * When the report was filed.
   * @format date-time
   * @example "2026-04-10T08:00:00.000Z"
   */
  createdAt: string;
  /**
   * When the report was last changed.
   * @format date-time
   * @example "2026-04-11T09:00:00.000Z"
   */
  updatedAt: string;
  /** The reporter's summary; `null` when the account no longer exists. */
  reporter: AdminUserSummaryDto | null;
  /** The reported account when `targetType` is `USER`; `null` for journey reports and when the account no longer exists. */
  targetUser: AdminUserSummaryDto | null;
  /** The reported journey when `targetType` is `PUBLISHED_JOURNEY`; `null` for account reports and when the journey no longer exists. */
  targetPublishedJourney: AdminReportPublishedJourneySummaryDto | null;
  /** Report counts for the same target. */
  targetReportCounts: AdminReportTargetCountsDto;
}

export interface AdminReportPageDto {
  /** Reports on this page, newest first. */
  items: AdminReportDto[];
  /**
   * Total number of matching reports.
   * @example 18
   */
  total: number;
  /**
   * The page returned.
   * @example 1
   */
  page: number;
  /**
   * Reports per page.
   * @example 20
   */
  limit: number;
}

export interface AdminReportTargetTypeStatsDto {
  /**
   * Reports on accounts.
   * @example 3
   */
  userReports: number;
  /**
   * Reports on published journeys.
   * @example 7
   */
  publishedJourneyReports: number;
}

export interface AdminReportStatsDto {
  /**
   * All reports.
   * @example 10
   */
  totalReports: number;
  /**
   * Open reports (`PENDING` + `REVIEWED`).
   * @example 4
   */
  openReports: number;
  /**
   * Reports in `PENDING`.
   * @example 3
   */
  pendingReports: number;
  /**
   * Reports in `REVIEWED`.
   * @example 1
   */
  reviewedReports: number;
  /**
   * Reports in `RESOLVED`.
   * @example 5
   */
  resolvedReports: number;
  /**
   * Reports in `REJECTED`.
   * @example 1
   */
  rejectedReports: number;
  /** Reports by target type. */
  byTargetType: AdminReportTargetTypeStatsDto;
}

export interface UpdateAdminReportDto {
  /**
   * New moderation status. `RESOLVED`/`REJECTED` record `resolvedAt`/`resolvedBy`; `PENDING`/`REVIEWED` clear them.
   * @example "REVIEWED"
   */
  status?: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  /**
   * Admin note (trimmed). `null` or a blank string clears the existing note.
   * @maxLength 1000
   * @example "Reviewing together with similar reports."
   */
  adminNote?: string | null;
}

/** One photo of a stored private journey: the fields the app wrote plus its upload state. */
export interface PrivateJourneyPhotoDto {
  /**
   * The photo's stable client id, unique within the journey. It keys the photo's uploaded original (presign/commit) and is how a publish selects photos.
   * @pattern ^[A-Za-z0-9_-]{1,122}$
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Capture time.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  takenAt: string;
  /**
   * Display position within the journey, ascending. A publish without `photoIds` publishes the photos in this order.
   * @min 0
   * @example 0
   */
  order: number;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Width in pixels; `null` when unknown.
   * @example 4032
   */
  width: number | null;
  /**
   * Height in pixels; `null` when unknown.
   * @example 3024
   */
  height: number | null;
  /** The local-time context of the capture; `null` when unknown. */
  captureTime: CaptureTimeContextDto | null;
  /**
   * Server id of the photo's original upload, assigned by presign (send it back on commit); `null` until the photo is first presigned.
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string | null;
  /**
   * True once the original is uploaded and committed; only then can the photo be downloaded or published.
   * @example true
   */
  uploaded: boolean;
}

/** A moment's place as the app keeps it. Every field is `null` when unknown. */
export interface PrivateJourneyMomentLocationDto {
  /**
   * Latitude in degrees.
   * @example 37.579617
   */
  lat: number | null;
  /**
   * Longitude in degrees.
   * @example 126.977041
   */
  lng: number | null;
  /**
   * Radius around the point, in meters.
   * @example 120
   */
  radiusM: number | null;
  /**
   * The English canonical place name.
   * @example "Gyeongbokgung Palace"
   */
  locationName: string | null;
  /**
   * The short label the app shows for the place.
   * @example "Jongno"
   */
  labelName: string | null;
  /**
   * A name the owner typed.
   * @example "Our favorite corner"
   */
  customName: string | null;
  /**
   * The place name per app locale.
   * @example {"en-US":"Seoul","ko-KR":"서울"}
   */
  localizedNames: Record<string, string>;
  /**
   * The more detailed place name per app locale.
   * @example {"en-US":"Seoul","ko-KR":"서울"}
   */
  localizedDetailNames: Record<string, string>;
}

/** A block of a journey timeline. */
export interface PrivateJourneyMomentDto {
  /**
   * Opaque id, unique within the document and kept across edits: it becomes the published moment’s web URL.
   * @pattern ^[A-Za-z0-9_-]{1,128}$
   * @example "clu_time_space_1a2b3c4d"
   */
  id: string;
  /**
   * `PHOTO_GROUP`: a block of photos. `ORPHAN_PHOTO`: the one trailing item of unassigned photos.
   * @example "PHOTO_GROUP"
   */
  type: "PHOTO_GROUP" | "ORPHAN_PHOTO";
  /**
   * Start of the moment.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  startAt: string;
  /**
   * End of the moment.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  endAt: string;
  /** Where it happened; `null` when unknown. */
  location: PrivateJourneyMomentLocationDto | null;
  /**
   * Its photos, each listed in the document’s `photos`.
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  photoIds: string[];
  /**
   * The owner's caption; `null` when there is none.
   * @example "The air by the palace was calm."
   */
  caption: string | null;
}

/** The finalized timeline of a journey (document version 4). */
export interface PrivateJourneyTimelineDto {
  /**
   * Document version: always 4.
   * @example 4
   */
  version: 4;
  /**
   * The `draftId` of the recap the timeline started from.
   * @example "draft_0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b_9f86d081"
   */
  draftId: string;
  /** The moments, in display order. */
  moments: PrivateJourneyMomentDto[];
}

/** A stored private journey as the server holds it. Read only by its owner's account. */
export interface PrivateJourneyDto {
  /**
   * The client-generated journey id (UUID v4).
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * Opaque concurrency token, replaced on every successful PUT (photo presign/commit leave it alone). Send it as `If-Match` on the next update.
   * @example "Xk3pQ9vN2mL7rT5w"
   */
  revision: string;
  /**
   * Journey start.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  startedAt: string;
  /**
   * Journey end; `null` while the journey is ongoing.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  endedAt: string | null;
  /** Title and description, as stored. */
  metadata: {
    /**
     * Journey title; `null` when it has none.
     * @example "A spring walk in Seoul"
     */
    title: string | null;
    /**
     * The owner's notes; `null` when there are none.
     * @example "Slow evening light along the Han River."
     */
    description: string | null;
  };
  /** Every photo, with its current upload state. */
  photos: PrivateJourneyPhotoDto[];
  /** The timeline as last written; `null` when there is no recap. */
  timeline: PrivateJourneyTimelineDto | null;
  /**
   * When the server first stored the journey.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  createdAt: string;
  /**
   * Server time of the last change: a PUT, or a photo commit (which does not change `revision`). This is what the sync list orders and filters by.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  updatedAt: string;
}

/** A journey deleted since the sync watermark — remove it locally. Tombstones are kept 35 days, so a device that has not synced for longer must run a full sync (omit updatedSince). */
export interface PrivateJourneyTombstoneDto {
  /**
   * The deleted journey id.
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * When it was deleted.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  deletedAt: string;
}

/** One page of changes since the sync watermark. */
export interface PrivateJourneyListDto {
  /** Live journeys created or changed in this window, oldest change first. No download URLs — fetch one journey for those. */
  items: PrivateJourneyDto[];
  /** Journeys deleted in this window — remove them locally. Items and tombstones together make up at most `limit` rows. */
  tombstones: PrivateJourneyTombstoneDto[];
  /**
   * Request the next page with this value as `cursor`; `null` on the last page.
   * @example "eyJ1cGRhdGVkQXQiOiIyMDI2LTAzLTMxVDAyOjExOjQ1LjAwMFoiLCJpZCI6IjAxOTVlYjFiLTJmM2MtN2Q0ZS04ZjVhLTZiN2M4ZDllMGYxYSJ9"
   */
  nextCursor: string | null;
  /**
   * Sync watermark: persist it once the last page is applied and send it as `updatedSince` next time. It trails the server clock by about two minutes on purpose, so a write that committed while this list was being read is delivered next time rather than missed; the next sync may therefore repeat a few journeys or tombstones already received (applying them again is harmless).
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  syncedAt: string;
}

/** One photo of a private journey as the app writes it. Upload state is server-owned and not accepted here. */
export interface PrivateJourneyPhotoInputDto {
  /**
   * The photo's stable client id, unique within the journey. It keys the photo's uploaded original (presign/commit) and is how a publish selects photos.
   * @pattern ^[A-Za-z0-9_-]{1,122}$
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Capture time.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  takenAt: string;
  /**
   * Display position within the journey, ascending. A publish without `photoIds` publishes the photos in this order.
   * @min 0
   * @example 0
   */
  order: number;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Width in pixels; `null` when unknown.
   * @example 4032
   */
  width: number | null;
  /**
   * Height in pixels; `null` when unknown.
   * @example 3024
   */
  height: number | null;
  /** The local-time context of the capture; `null` when unknown. */
  captureTime: CaptureTimeContextDto | null;
}

/** The whole private journey document, version 4 (the journey id comes from the path). A PUT replaces the stored document. The JSON of `metadata` and `timeline` must fit in 1 MB (413 otherwise). */
export interface PutPrivateJourneyRequestDto {
  /**
   * Journey start.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  startedAt: string;
  /**
   * Journey end; `null` while the journey is ongoing.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  endedAt: string | null;
  /** Title and description. */
  metadata: {
    /**
     * Journey title; `null` when it has none.
     * @example "A spring walk in Seoul"
     */
    title: string | null;
    /**
     * The owner's notes; `null` when there are none.
     * @example "Slow evening light along the Han River."
     */
    description: string | null;
  };
  /**
   * Every photo of the journey (may be empty), each id once. A photo the stored document listed and this one doesn't is removed, and its uploaded original is deleted.
   * @maxItems 5000
   */
  photos: PrivateJourneyPhotoInputDto[];
  /** The finalized timeline; `null` when the journey has no recap yet. Each moment’s `photoIds` must be listed in `photos`. */
  timeline: PrivateJourneyTimelineDto | null;
}

/** One photo's upload state after a PUT. */
export interface PutPrivateJourneyPhotoStatusDto {
  /**
   * The photo id, as sent.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Server id of the photo's original upload; `null` until the photo is first presigned.
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string | null;
  /**
   * True once the original is uploaded and committed. False means: presign, upload and commit it.
   * @example false
   */
  uploaded: boolean;
}

/** The stored revision and each photo’s upload state. */
export interface PrivateJourneyWriteResultDto {
  /**
   * The journey id from the path.
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * The new revision (or, for a repeated identical create, the unchanged one) — send it as `If-Match` on the next update.
   * @example "Xk3pQ9vN2mL7rT5w"
   */
  revision: string;
  /**
   * Server time of the stored version.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  updatedAt: string;
  /** Upload state of every photo in the stored document, so the app knows which originals still need uploading. */
  photos: PutPrivateJourneyPhotoStatusDto[];
}

/** A stored photo with a short-lived download link for its uploaded original. */
export interface PrivateJourneyPhotoWithDownloadDto {
  /**
   * The photo's stable client id, unique within the journey. It keys the photo's uploaded original (presign/commit) and is how a publish selects photos.
   * @pattern ^[A-Za-z0-9_-]{1,122}$
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Capture time.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  takenAt: string;
  /**
   * Display position within the journey, ascending. A publish without `photoIds` publishes the photos in this order.
   * @min 0
   * @example 0
   */
  order: number;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Width in pixels; `null` when unknown.
   * @example 4032
   */
  width: number | null;
  /**
   * Height in pixels; `null` when unknown.
   * @example 3024
   */
  height: number | null;
  /** The local-time context of the capture; `null` when unknown. */
  captureTime: CaptureTimeContextDto | null;
  /**
   * Server id of the photo's original upload, assigned by presign (send it back on commit); `null` until the photo is first presigned.
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string | null;
  /**
   * True once the original is uploaded and committed; only then can the photo be downloaded or published.
   * @example true
   */
  uploaded: boolean;
  /**
   * Presigned S3 GET URL of the original, valid for 15 minutes; `null` until `uploaded` is true.
   * @format uri
   * @example "https://momentbook-assets.s3.ap-northeast-2.amazonaws.com/private-journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/pV3nX8qL2mK9rT4w.jpg?X-Amz-Expires=900"
   */
  downloadUrl: string | null;
  /**
   * When `downloadUrl` stops working; `null` with it. Fetch the journey again for fresh links.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  expiresAt: string | null;
}

/** A stored private journey with short-lived download links for its uploaded photos. */
export interface PrivateJourneyDetailDto {
  /**
   * The client-generated journey id (UUID v4).
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * Opaque concurrency token, replaced on every successful PUT (photo presign/commit leave it alone). Send it as `If-Match` on the next update.
   * @example "Xk3pQ9vN2mL7rT5w"
   */
  revision: string;
  /**
   * Journey start.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  startedAt: string;
  /**
   * Journey end; `null` while the journey is ongoing.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  endedAt: string | null;
  /** Title and description, as stored. */
  metadata: {
    /**
     * Journey title; `null` when it has none.
     * @example "A spring walk in Seoul"
     */
    title: string | null;
    /**
     * The owner's notes; `null` when there are none.
     * @example "Slow evening light along the Han River."
     */
    description: string | null;
  };
  /** Every photo, with its upload state and, once uploaded, a 15-minute download URL. */
  photos: PrivateJourneyPhotoWithDownloadDto[];
  /** The timeline as last written; `null` when there is no recap. */
  timeline: PrivateJourneyTimelineDto | null;
  /**
   * When the server first stored the journey.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  createdAt: string;
  /**
   * Server time of the last change: a PUT, or a photo commit (which does not change `revision`). This is what the sync list orders and filters by.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  updatedAt: string;
}

/** One photo original the app is about to upload. */
export interface PresignPrivateJourneyAssetRequestDto {
  /**
   * The photo's `photoId` in the private journey document. It may be presigned before the PUT that lists it; an upload for a photo the document never lists stays orphaned until the journey is deleted.
   * @maxLength 256
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * The file's media type (the app uploads its already-resized JPEG or WebP files). The upload must send exactly this `Content-Type`.
   * @example "image/jpeg"
   */
  contentType: "image/jpeg" | "image/webp";
  /**
   * Exact file size in bytes (1 to 5 MB). The upload must send exactly this many bytes.
   * @min 1
   * @max 5242880
   * @example 1048576
   */
  sizeBytes: number;
}

export interface PresignPrivateJourneyAssetsRequestDto {
  /**
   * The photos to upload, 1 to 100 per call.
   * @maxItems 100
   * @minItems 1
   */
  assets: PresignPrivateJourneyAssetRequestDto[];
}

/** Where to upload one photo original, or the signal that it is already uploaded. */
export interface PresignedPrivateJourneyAssetDto {
  /**
   * The photo id, as sent.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Server id of the photo's original; send it back on commit. Stable across repeated presigns of the same photo unless its content type changes.
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string;
  /**
   * Presigned S3 URL: `PUT` the file bytes here with exactly the declared `Content-Type` and length, then commit. `null` when `alreadyUploaded` is true.
   * @format uri
   * @example "https://momentbook-assets.s3.ap-northeast-2.amazonaws.com/private-journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/pV3nX8qL2mK9rT4w.jpg?X-Amz-Expires=3600"
   */
  uploadUrl: string | null;
  /**
   * How long `uploadUrl` stays valid, in seconds (one hour).
   * @example 3600
   */
  expiresInSeconds: number;
  /**
   * When `uploadUrl` stops working.
   * @format date-time
   * @example "2026-03-30T03:00:00.000Z"
   */
  expiresAt: string;
  /**
   * True when this photo of this journey is already uploaded and committed — skip it. Makes a resumed batch upload safe.
   * @example false
   */
  alreadyUploaded: boolean;
}

/** Upload targets for the requested photos. */
export interface PresignedPrivateJourneyAssetsDto {
  /** One entry per requested photo. */
  assets: PresignedPrivateJourneyAssetDto[];
}

/** One uploaded photo original to confirm. */
export interface CommitPrivateJourneyAssetRequestDto {
  /**
   * The photo's `photoId` in the private journey document.
   * @maxLength 256
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * The `assetId` the presign returned for this photo. A stale one (the photo was presigned again with another content type) is reported `verified: false`.
   * @maxLength 128
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string;
}

export interface CommitPrivateJourneyAssetsRequestDto {
  /**
   * The uploaded photos to confirm, 1 to 100 per call.
   * @maxItems 100
   * @minItems 1
   */
  assets: CommitPrivateJourneyAssetRequestDto[];
}

/** The outcome of confirming one photo upload. */
export interface CommitPrivateJourneyAssetResultDto {
  /**
   * The photo id, as sent.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * The asset id, as sent.
   * @example "pV3nX8qL2mK9rT4w"
   */
  assetId: string;
  /**
   * Size of the stored original in bytes; 0 when not verified.
   * @example 1048576
   */
  bytes: number;
  /**
   * True when the original is stored with the declared size and content type (or was already committed). False means it is missing, does not match its presign, or the asset id is unknown or stale — presign and upload this photo again.
   * @example true
   */
  verified: boolean;
}

/** Per-photo verification results. */
export interface CommittedPrivateJourneyAssetsDto {
  /** One entry per requested photo, in request order. */
  committed: CommitPrivateJourneyAssetResultDto[];
}

export interface PublicationDto {
  /**
   * The private journey this publishes (its owner-side key).
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * Public id of the publication (12 URL-safe characters). Kept across republishes, so links, likes and comments survive.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * `REVIEW_PENDING`: waiting for the admin review, or approved but still waiting for its translation — not public yet. `REVIEW_REJECTED`: rejected by the review. `PUBLIC`: approved and translated — live on public surfaces unless `visibility` is `HIDDEN`.
   * @example "REVIEW_PENDING"
   */
  status: "REVIEW_PENDING" | "REVIEW_REJECTED" | "PUBLIC";
  /**
   * True only when anyone can see it now: `PUBLIC` and not hidden by moderation.
   * @example false
   */
  publiclyVisible: boolean;
  /**
   * `HIDDEN`: taken down by moderation after reports. Survives a republish.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /**
   * Web URL of the public page; `null` unless publicly visible.
   * @format uri
   * @example "https://momentbook.app/journeys/V1StGXR8_Z5j"
   */
  publishedUrl: string | null;
  /** Review state of the current snapshot. */
  review: PublicReviewDto;
  /**
   * Number of published photos.
   * @example 24
   */
  photoCount: number;
  /**
   * First publish time (kept across republishes).
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  publishedAt: string;
  /**
   * Last change of the publication (republish, review decision, translation).
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  updatedAt: string;
}

export interface PublicationListDto {
  /** The caller's publications in every state, most recently changed first (at most 1000). */
  items: PublicationDto[];
}

/** A place name per app locale. `en-US` is always present (the canonical name); the others when known. */
export interface LocalizedNamesDto {
  /**
   * English (US) name.
   * @example "Seoul"
   */
  "en-US": string;
  /**
   * Korean name.
   * @example "서울"
   */
  "ko-KR"?: string;
  /**
   * Japanese name.
   * @example "ソウル"
   */
  "ja-JP"?: string;
  /**
   * Simplified Chinese name.
   * @example "首尔"
   */
  "zh-CN"?: string;
  /**
   * Spanish name.
   * @example "Seúl"
   */
  "es-ES"?: string;
  /**
   * Portuguese (Brazil) name.
   * @example "Seul"
   */
  "pt-BR"?: string;
  /**
   * French name.
   * @example "Séoul"
   */
  "fr-FR"?: string;
  /**
   * Thai name.
   * @example "โซล"
   */
  "th-TH"?: string;
  /**
   * Vietnamese name.
   * @example "Seoul"
   */
  "vi-VN"?: string;
}

/** A resolved place, set by the app. It feeds the public memories regions. */
export interface PlaceInfoDto {
  /** The place name per locale. */
  names: LocalizedNamesDto;
  /**
   * Legacy alias of `names`.
   * @deprecated
   */
  localizedNames?: LocalizedNamesDto;
  /**
   * Legacy resolved label; use `names`.
   * @deprecated
   * @example "Gyeongbokgung Palace"
   */
  displayName?: string;
  /**
   * Where the name came from.
   * @example "GOOGLE_PLACES"
   */
  source: PlaceNameSource;
  /**
   * Provider place id (e.g. a Google place id).
   * @example "ChIJm7u-8H7raDURzR3JzA8pW4M"
   */
  placeId?: string;
  /** Coordinates of the place. */
  coordinates?: LatLngDto;
  /**
   * When the name was resolved.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  resolvedAt: string;
}

/** Where a moment happened. Every field is `null` when unknown. */
export interface PublishMomentLocationInputDto {
  /**
   * The place name to show.
   * @example "Gyeongbokgung"
   */
  displayName: string | null;
  /**
   * Latitude in degrees.
   * @example 37.579617
   */
  lat: number | null;
  /**
   * Longitude in degrees.
   * @example 126.977041
   */
  lng: number | null;
  /**
   * Radius around the point, in meters.
   * @example 40
   */
  radiusM: number | null;
  /** The resolved place; `null` when there is none. */
  place: PlaceInfoDto | null;
}

/** One moment to publish, with the owner's edits and caption. */
export interface PublishMomentInputDto {
  /**
   * The moment’s id in the private journey, unique in the body; it becomes the moment’s web URL. A repeated or malformed id is `INVALID_RECAP_DRAFT`.
   * @pattern ^[A-Za-z0-9_-]{1,128}$
   * @example "clu_time_space_1a2b3c4d"
   */
  id: string;
  /**
   * `PHOTO_GROUP`: a block of photos. `ORPHAN_PHOTO`: the one trailing item of unassigned photos.
   * @example "PHOTO_GROUP"
   */
  type: "PHOTO_GROUP" | "ORPHAN_PHOTO";
  /**
   * Start of the moment.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  startAt: string;
  /**
   * End of the moment; not before `startAt`.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  endAt: string;
  /** Where it happened; `null` when unknown. */
  location: PublishMomentLocationInputDto | null;
  /**
   * The owner's caption; `null` when there is none.
   * @example "The air by the palace was calm."
   */
  impression: string | null;
  /**
   * Its photos, each listed in `photos`.
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  photoIds: string[];
}

/** One photo the published moments use. */
export interface PublishPhotoInputDto {
  /**
   * The private journey's `photoId`.
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Capture time.
   * @format date-time
   * @example "2026-03-30T02:00:00.000Z"
   */
  takenAt: string;
  /** Where the photo was taken; `null` when unknown. */
  location: LatLngDto | null;
  /**
   * Width in pixels; `null` when unknown.
   * @example 4032
   */
  width: number | null;
  /**
   * Height in pixels; `null` when unknown.
   * @example 3024
   */
  height: number | null;
  /** The local-time context of the capture; `null` when unknown. */
  captureTime: CaptureTimeContextDto | null;
}

export interface PublishJourneyRequestBodyDto {
  /**
   * The private journey's `photoId`s to publish (the app's photo ids, not UUIDs), in publish order, without repeats. Omit to publish every photo of the stored journey, ordered by `order`. Must include every photo the moments use, every one must already be uploaded (committed), and at most 300 photos can be published.
   * @maxItems 300
   * @minItems 1
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  photoIds?: string[];
  /**
   * The `photoId` of the cover photo. It must be one of the published photos; omitted or not published means no cover (lists then preview the first photo).
   * @maxLength 256
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  coverPhotoId?: string | null;
  /** Merged over the stored private journey's title and description, field by field (a field sent here wins). */
  metadata?: {
    /**
     * Journey title, in the source language. A publish without one is titled after the start date (`YYYY.MM.DD Journey`).
     * @example "A spring walk in Seoul"
     */
    title?: string | null;
    /**
     * The owner's notes, in the source language.
     * @example "Slow evening light along the Han River."
     */
    description?: string | null;
    /**
     * Language the title, description and captions are written in — the source of the automatic translation. One of ko, en, ja, zh, es, pt, fr, th, vi (a locale such as `ko-KR` is accepted); an unsupported value is published as `en`. When absent, `Accept-Language` is used, then `en`.
     * @example "ko"
     */
    sourceLanguage?: string | null;
  };
  /** The moments to publish, with the owner's edits and captions applied, in display order. This is what viewers see. Each lists only photos in `photos`. */
  moments: PublishMomentInputDto[];
  /** Every photo the moments use, once each — each must be among the published photos (`photoIds`). */
  photos: PublishPhotoInputDto[];
}

export interface UnpublishResultDto {
  /**
   * The public id the journey was published under; it no longer resolves.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Number of public S3 objects (published photos) deleted.
   * @example 24
   */
  deletedObjects: number;
}

export interface JourneyViewDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Always true: the view was counted.
   * @example true
   */
  recorded: boolean;
}

export interface JourneyEngagementDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Number of likes (all users).
   * @example 12
   */
  likeCount: number;
  /**
   * Number of comments this viewer can see: active comments, minus those by users in a block relationship with a signed-in viewer.
   * @example 4
   */
  commentCount: number;
  /**
   * Whether the signed-in viewer likes the journey; always false anonymously.
   * @example true
   */
  liked: boolean;
}

export interface JourneyLikeDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Whether the caller now likes the journey: true after PUT, false after DELETE.
   * @example true
   */
  liked: boolean;
  /**
   * Number of likes after the change.
   * @example 13
   */
  likeCount: number;
}

/** One comment on a public journey. */
export interface PublishedJourneyCommentDto {
  /**
   * Comment id.
   * @format uuid
   * @example "0199a1c4-7d2e-7f3a-9b4c-5d6e7f8a9b0c"
   */
  commentId: string;
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /** Who wrote it; `name` is `Anonymous` when the account has none or no longer exists. */
  author: UserSummaryDto;
  /**
   * The comment text (trimmed).
   * @example "Beautiful light in these photos."
   */
  body: string;
  /**
   * Whether the signed-in viewer may delete it: true for its author and for the journey owner.
   * @example false
   */
  canDelete: boolean;
  /**
   * Whether the signed-in viewer wrote it.
   * @example false
   */
  mine: boolean;
  /**
   * When it was posted.
   * @format date-time
   * @example "2026-04-14T12:00:00.000Z"
   */
  createdAt: string;
}

export interface PublishedJourneyCommentPageDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /** The comments of this page, newest first. */
  items: PublishedJourneyCommentDto[];
  /**
   * Number of comments this viewer can see.
   * @min 0
   * @example 4
   */
  total: number;
  /**
   * Current page.
   * @min 1
   * @example 1
   */
  page: number;
  /**
   * Page size applied.
   * @min 1
   * @example 20
   */
  limit: number;
}

export interface CreatePublishedJourneyCommentDto {
  /**
   * Comment text, plain. Leading and trailing whitespace is trimmed; the result must not be empty.
   * @minLength 1
   * @maxLength 1000
   * @example "Beautiful light in these photos."
   */
  body: string;
}

export interface DeletedCommentDto {
  /**
   * Id of the deleted comment.
   * @format uuid
   * @example "0199a1c4-7d2e-7f3a-9b4c-5d6e7f8a9b0c"
   */
  commentId: string;
}

export interface PublishedJourneyAnalyticsSummaryDto {
  /**
   * Total recorded views (every view call is counted).
   * @example 42
   */
  viewCount: number;
  /**
   * Current number of likes.
   * @example 12
   */
  likeCount: number;
  /**
   * Current number of active comments (all commenters).
   * @example 4
   */
  commentCount: number;
}

/** One country bucket. */
export interface JourneyInteractionCountryCountDto {
  /**
   * ISO 3166-1 alpha-2 country code.
   * @example "KR"
   */
  countryCode: string;
  /**
   * Count attributed to the country.
   * @example 12
   */
  count: number;
}

/** Counts by country. A country with fewer than `disclosureThreshold` counts is not listed — its counts are added to `withheldCount` — so small audiences cannot be singled out. */
export interface JourneyInteractionCountryBreakdownDto {
  /** Countries at or above the disclosure threshold, largest count first. */
  countries: JourneyInteractionCountryCountDto[];
  /**
   * Sum of the counts of countries below the threshold.
   * @example 2
   */
  withheldCount: number;
  /**
   * Counts recorded without a trusted country signal (no CDN country header).
   * @example 1
   */
  unknownCount: number;
  /**
   * Minimum count for a country to be listed (server configuration, 3 by default).
   * @example 3
   */
  disclosureThreshold: number;
}

export interface PublishedJourneyAnalyticsGeographyDto {
  /** Views by country. */
  views: JourneyInteractionCountryBreakdownDto;
  /** Likes by the liker's country at the time of the like. */
  likes: JourneyInteractionCountryBreakdownDto;
  /** Active comments by the commenter's country. */
  comments: JourneyInteractionCountryBreakdownDto;
}

export interface PublishedJourneyAnalyticsDto {
  /**
   * Public id of the journey.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /** Totals; never withheld. */
  summary: PublishedJourneyAnalyticsSummaryDto;
  /** Per-country breakdowns, with small countries withheld. */
  geography: PublishedJourneyAnalyticsGeographyDto;
}

export interface AdminCommentJourneyDto {
  /**
   * Public id of the journey the comment is on.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Id of the account that owns the journey.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  ownerUserId: string;
}

export interface AdminCommentDto {
  /**
   * Comment id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  commentId: string;
  /**
   * Public id of the journey the comment is on.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * Comment text as written.
   * @example "Lovely route!"
   */
  body: string;
  /**
   * Comment state.
   * @example "ACTIVE"
   */
  status: "ACTIVE" | "DELETED";
  /**
   * Who deleted the comment; `null` while it is active.
   * @example null
   */
  deletedByRole: "AUTHOR" | "JOURNEY_OWNER" | "ADMIN" | null;
  /**
   * When the comment was deleted; `null` while it is active.
   * @format date-time
   * @example null
   */
  deletedAt: string | null;
  /**
   * When the comment was written.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /** The comment author. */
  author: AdminUserSummaryDto;
  /** The journey the comment is on. */
  journey: AdminCommentJourneyDto;
}

export interface AdminCommentPageDto {
  /** The page of comments, newest first. */
  items: AdminCommentDto[];
  /**
   * Comments matching the filters.
   * @example 134
   */
  total: number;
  /**
   * Current page, 1-based.
   * @example 1
   */
  page: number;
  /**
   * Rows per page.
   * @example 20
   */
  limit: number;
}

export interface UpdateAdminCommentStatusDto {
  /**
   * The only supported change: `DELETED` removes the comment.
   * @example "DELETED"
   */
  status: "DELETED";
  /**
   * Free-text admin note on why (up to 1000 characters). Stored in the admin action log.
   * @maxLength 1000
   * @example "Harassment, reported by the journey owner"
   */
  reason?: string;
}

export interface AdminCommentStatusDto {
  /**
   * Comment id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  commentId: string;
  /**
   * Always `DELETED`.
   * @example "DELETED"
   */
  status: "DELETED";
  /**
   * Who deleted the comment: `ADMIN` for this call, or the earlier deleter when it was already deleted.
   * @example "ADMIN"
   */
  deletedByRole: "AUTHOR" | "JOURNEY_OWNER" | "ADMIN";
}

/** The review state of a publication as an admin sees it (ADR-0085): every publish and republish starts `PENDING` until an admin decides it. A journey is public only when `status` is `APPROVED` and `localizationPending` is `false`. */
export interface AdminPublishedJourneyReviewDto {
  /**
   * The admin decision on the current snapshot: `PENDING` (waiting for review), `APPROVED` or `REJECTED`.
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
  /**
   * `true` when `status` is `APPROVED`.
   * @example true
   */
  approved: boolean;
  /**
   * `true` while the translation of the current snapshot has not landed yet. The journey is not public until it clears, even once APPROVED (ADR-0080).
   * @example false
   */
  localizationPending: boolean;
  /**
   * Who made the current decision. Always `ADMIN` for new decisions; `AI` appears only on journeys decided before ADR-0085 removed the automated reviewer. `null` while undecided.
   * @example "ADMIN"
   */
  decidedBy: "AI" | "ADMIN" | null;
  /**
   * When the current decision was made; `null` while undecided.
   * @format date-time
   * @example "2026-07-27T12:00:00.000Z"
   */
  decidedAt: string | null;
  /**
   * `true` when sending the translation job after the publish failed; an admin can retry it with `POST /core/admin/journeys/publish/{publicId}/review/requeue`.
   * @example false
   */
  enqueueFailed: boolean;
}

/** A publication in the admin review queue: the public list item plus review bookkeeping. Includes journeys in every review state, hidden ones, and ones being unpublished. */
export interface AdminPublishedJourneyItemDto {
  /**
   * Public id of the published journey (12 URL-safe characters) — the id the public journey pages and share links use.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's private journey id (always present for admins).
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * User id of the author.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /**
   * When the journey started.
   * @format date-time
   * @example "2026-10-07T09:00:00.000Z"
   */
  startedAt: string;
  /**
   * When the journey ended; `null` when it has no end time.
   * @format date-time
   * @example "2026-10-08T09:00:00.000Z"
   */
  endedAt: string | null;
  /** Local wall-clock context of `startedAt` for display (`UNKNOWN` when not known). */
  startedAtLocal: LocalDateTimeContextDto;
  /** Local wall-clock context of `endedAt`; `null` exactly when `endedAt` is. */
  endedAtLocal: LocalDateTimeContextDto | null;
  /**
   * Number of published photos.
   * @min 0
   * @example 12
   */
  photoCount: number;
  /**
   * Preview image URL: the cover photo's thumbnail variant (falling back to its display or full-size image), else the first photo's; `null` when the journey has no image.
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/variants/1759914000000-a1b2.display.webp"
   */
  thumbnailUrl: string | null;
  /** Up to three representative images (cover first) for link previews and web metadata; `[]` when there are none. */
  seoImages: PublishedJourneySeoImageDto[];
  /** The journey's text with the response language applied. */
  metadata: PublishedJourneyMetadataDto;
  /**
   * When the journey was first published (a republish keeps it); `null` when not recorded.
   * @format date-time
   * @example "2026-10-07T12:00:00.000Z"
   */
  publishedAt: string | null;
  /**
   * When the published journey record was created.
   * @format date-time
   * @example "2026-10-07T11:58:30.000Z"
   */
  createdAt: string;
  /**
   * When the published journey record last changed (republish, review, translation); `null` when not recorded. Prefer it as a web sitemap `lastmod`.
   * @format date-time
   * @example "2026-10-07T12:05:00.000Z"
   */
  updatedAt: string | null;
  /** Review state of the current snapshot. */
  review: AdminPublishedJourneyReviewDto;
  /**
   * Moderation visibility: `PUBLIC`, or `HIDDEN` after a moderation action.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /**
   * How the item should be rendered: `AVAILABLE`, `REPORTED_HIDDEN`, `REVIEW_PENDING` or `REVIEW_REJECTED`.
   * @example "AVAILABLE"
   */
  contentStatus:
    | "AVAILABLE"
    | "REPORTED_HIDDEN"
    | "REVIEW_PENDING"
    | "REVIEW_REJECTED";
  /**
   * Recap stage at publish time. Every publication made since ADR-0083 is `FINALIZED`; `NONE` appears only on older rows.
   * @example "FINALIZED"
   */
  recapStage: "NONE" | "FINALIZED";
  /**
   * Always true in this list (unpublished journeys are deleted, not listed).
   * @example true
   */
  published: boolean;
  /**
   * Identifies the snapshot under review (ADR-0085). Send it back as `publishOperationId` on `PATCH .../review`. `null` only on legacy rows.
   * @example "V1StGXR8_Z5jdHi6B-myT"
   */
  publishOperationId: string | null;
  /**
   * When the current snapshot was submitted for review (its publish or republish). Older rows were filled from their first publish time; `null` only where that is unknown too.
   * @format date-time
   * @example "2026-10-20T09:30:00.000Z"
   */
  reviewRequestedAt: string | null;
}

export interface AdminPublishedJourneyPageDto {
  /** The publications of this page, newest publish first. */
  items: AdminPublishedJourneyItemDto[];
  /**
   * Number of publications matching the filters.
   * @example 12
   */
  total: number;
  /**
   * Current page.
   * @example 1
   */
  page: number;
  /**
   * Page size applied.
   * @example 20
   */
  limit: number;
}

/** The full journey whatever its review or moderation state (`contentStatus` and `notice` describe that state), with the admin-only review state and diagnostics. `journeyId` is always set. */
export interface AdminPublishedJourneyDetailDto {
  /**
   * Public id of the publication (12 characters, URL-safe).
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's private journey id (always present for admins).
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * The author's account id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  userId: string;
  /** The author's public profile. */
  author: UserSummaryDto;
  /**
   * When the journey started.
   * @format date-time
   * @example "2026-03-30T09:00:00.000Z"
   */
  startedAt: string;
  /**
   * When the journey ended; `null` for an open-ended journey.
   * @format date-time
   * @example "2026-03-31T09:00:00.000Z"
   */
  endedAt: string | null;
  /** Local display context of `startedAt` (`UNKNOWN` rather than guessed). */
  startedAtLocal: LocalDateTimeContextDto;
  /** Local display context of `endedAt`; `null` when `endedAt` is. */
  endedAtLocal: LocalDateTimeContextDto | null;
  /**
   * Title, in the response language when a translation exists, else the original; `null` when the author wrote none.
   * @example "A spring walk in Seoul"
   */
  title: string | null;
  /**
   * Description, in the response language when a translation exists, else the original; `null` when the author wrote none.
   * @example "Slow evening light along the Han River."
   */
  description: string | null;
  /**
   * Hashtags, each starting with `#`, in the response language, else the source language; `[]` until the translation lands and in a status-focused payload.
   * @example ["#spring","#seoul"]
   */
  hashtags: string[];
  /**
   * Preview image URL: the cover (thumbnail or display variant when available), else the first photo; `null` when the journey has no image.
   * @format uri
   * @example "https://cdn.momentbook.app/journeys/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b/originals/Qm8rT2vX5nL9pK3w.jpg"
   */
  thumbnailUrl: string | null;
  /**
   * Web URL of the journey page, for sharing; `null` when unset.
   * @format uri
   * @example "https://momentbook.app/journeys/V1StGXR8_Z5j"
   */
  shareUrl: string | null;
  /**
   * Number of published photos; 0 in a status-focused payload.
   * @min 0
   * @example 24
   */
  photoCount: number;
  /** Every published photo, keyed by `photoId`; `[]` in a status-focused payload. */
  images: PublishedJourneyImageDto[];
  /** The moments, ordered by start time; `[]` in a status-focused payload. */
  moments: PublishedMomentDto[];
  /** All translations, for clients that switch language locally; `null` until the translation lands, and in a status-focused payload. */
  localizedContent: PublishedJourneyLocalizedContentDto | null;
  /** Up to three representative images (cover first) for web metadata and image sitemaps; `[]` in a status-focused payload. */
  seoImages: PublishedJourneySeoImageDto[];
  /**
   * First publish time (kept across republishes); `null` only on legacy rows.
   * @format date-time
   * @example "2026-03-31T02:11:45.000Z"
   */
  publishedAt: string | null;
  /**
   * When the publication record was created.
   * @format date-time
   * @example "2026-03-31T02:11:45.000Z"
   */
  createdAt: string;
  /**
   * Last change of the publication (republish, review, translation). Prefer it for sitemap `lastmod`.
   * @format date-time
   * @example "2026-04-01T09:00:00.000Z"
   */
  updatedAt: string;
  /** Review state of the current snapshot. */
  review: AdminPublishedJourneyReviewDto;
  /**
   * `AVAILABLE`: the full journey. `REVIEW_PENDING` / `REVIEW_REJECTED`: waiting for, or failed, admin review. `REPORTED_HIDDEN`: taken down after reports. Anything but `AVAILABLE` comes with `notice` and no content.
   * @example "AVAILABLE"
   */
  contentStatus:
    | "AVAILABLE"
    | "REPORTED_HIDDEN"
    | "REVIEW_PENDING"
    | "REVIEW_REJECTED";
  /**
   * Moderation visibility: `HIDDEN` once reports took it down.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /**
   * English explanation shown instead of the content; `null` when `contentStatus` is `AVAILABLE`.
   * @example "This journey is pending review and is not yet visible."
   */
  notice: string | null;
  /** The model that wrote the stored translation (an operator can tell a real worker model from the stub of rows written before ADR-0080); `null` until a translation has landed. */
  localizationModel: string | null;
  /**
   * `true` only when the journey is APPROVED, not waiting for a translation and has none: the fingerprint of an `acceptUntranslated` approval (ADR-0080).
   * @example false
   */
  publishedWithoutTranslation: boolean;
  /**
   * Identifies the snapshot shown (ADR-0085). Send it back as `publishOperationId` with the review decision. `null` only on legacy rows.
   * @example "V1StGXR8_Z5jdHi6B-myT"
   */
  publishOperationId: string | null;
}

export interface UpdatePublishedJourneyReviewRequestDto {
  /**
   * The decision. `APPROVED` or `REJECTED` decide the review; `PENDING` puts it back in the queue.
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
  /**
   * Escape hatch, only with `status: APPROVED` (ADR-0080): make the journey public now although its translation has not landed — every language shows the original text until a translation arrives and fills it in. Audit-logged and posted to the review alert channel. Use only when the translation is known to be stuck.
   * @default false
   * @example false
   */
  acceptUntranslated?: boolean;
  /**
   * The `publishOperationId` of the snapshot the admin reviewed (from the list or detail response). If the owner has republished since, the decision is rejected with `REVIEW_STATE_CONFLICT` instead of deciding content nobody looked at. Omit to decide whatever snapshot is current.
   * @maxLength 64
   * @example "V1StGXR8_Z5jdHi6B-myT"
   */
  publishOperationId?: string;
}

export interface PublishedJourneyReviewResultDto {
  /**
   * Public id of the publication.
   * @example "V1StGXR8_Z5j"
   */
  publicId: string;
  /**
   * The author's private journey id.
   * @format uuid
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * Whether the publication still exists in a published state.
   * @example true
   */
  published: boolean;
  /**
   * Moderation visibility.
   * @example "PUBLIC"
   */
  visibility: "PUBLIC" | "HIDDEN";
  /** Review state after the decision. `localizationPending` still `true` after an APPROVED decision means the journey goes public when its translation lands. */
  review: AdminPublishedJourneyReviewDto;
  /**
   * Last change of the publication.
   * @format date-time
   * @example "2026-04-03T12:34:56.000Z"
   */
  updatedAt: string;
}

export interface RequeueJourneyReviewResultDto {
  /**
   * The job sent: `["LOCALIZATION"]`, or empty (not an error) when the journey has no text to translate.
   * @example ["LOCALIZATION"]
   */
  dispatched: "LOCALIZATION"[];
}

/** One photo's metadata (no image bytes are sent). */
export interface RecapPhotoInputDto {
  /**
   * The app's identifier of the photo; the draft refers to the photo by it (`photoIds`, `orphanPhotoIds`).
   * @example "7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"
   */
  photoId: string;
  /**
   * Capture time, RFC 3339 (not before 1970).
   * @format date-time
   * @example "2024-01-01T00:00:10.000Z"
   */
  takenAt: string;
  /**
   * Whether `lat`/`lng` are real GPS coordinates.
   * @example true
   */
  hasGps: boolean;
  /**
   * Latitude in degrees, when the photo has GPS.
   * @min -90
   * @max 90
   * @example 37.5665
   */
  lat?: number;
  /**
   * Longitude in degrees, when the photo has GPS.
   * @min -180
   * @max 180
   * @example 126.978
   */
  lng?: number;
}

export interface CreateJourneyRecapDraftRequestDto {
  /**
   * The journey id (the private journey id); part of the `draftId`.
   * @example "0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b"
   */
  journeyId: string;
  /**
   * The photos to cluster (at most 3000).
   * @maxItems 3000
   */
  photos: RecapPhotoInputDto[];
}

/** A group of photos taken close together in time (and space, when they have GPS). Photo ids are the `photoId` values of the request's photos. */
export interface RecapMomentDto {
  /**
   * Content-derived id, unique within one run; it becomes the moment’s id in the journey document.
   * @example "clu_time_space_1a2b3c4d"
   */
  id: string;
  /**
   * First photo time.
   * @format date-time
   * @example "2026-03-30T02:20:00.000Z"
   */
  startAt: string;
  /**
   * Last photo time.
   * @format date-time
   * @example "2026-03-30T04:20:00.000Z"
   */
  endAt: string;
  /** Center; `null` for a time-only cluster. */
  center: LatLngDto | null;
  /**
   * Radius around the center in meters; `null` without a center.
   * @example 120
   */
  radiusM: number | null;
  /**
   * The photos of the moment, in time order.
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  photoIds: string[];
}

/** A recap computed by the server: photo moments and the photos left out of them. The app builds its timeline from it. */
export interface RecapDraftDto {
  /**
   * Deterministic draft id: the same journey id and photos (`photoId` and `takenAt` as sent, in order) give the same id.
   * @example "draft_0199a1b2-3c4d-4e5f-8a9b-0c1d2e3f4a5b_9f86d081"
   */
  draftId: string;
  /** The moments, in time order. */
  moments: RecapMomentDto[];
  /**
   * Photos left out of every moment. Photo ids are the `photoId` values of the request's photos.
   * @example ["7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f"]
   */
  orphanPhotoIds: string[];
}

export interface VersionCheckDataDto {
  /**
   * The platform checked, as sent.
   * @example "ios"
   */
  platform: "ios" | "android";
  /**
   * The `version` that was checked, as sent.
   * @example "1.8.4"
   */
  clientVersion: string;
  /**
   * Lowest version the server still supports on this platform.
   * @example "2.0.0"
   */
  minSupportedVersion: string;
  /**
   * Newest released version on this platform. Absent when not configured.
   * @example "2.1.3"
   */
  latestVersion?: string;
  /**
   * Update mode configured for the platform: `force` (builds below the minimum must update), `soft` (updates are only suggested), `none` (no update prompts).
   * @example "force"
   */
  updateMode: "force" | "soft" | "none";
  /**
   * App Store / Play Store page to send the user to. Absent when not configured.
   * @format uri
   * @example "https://apps.apple.com/app/id6740000000"
   */
  storeUrl?: string;
  /**
   * Whether the app should prompt for an update (forced or optional).
   * @example true
   */
  shouldUpdate: boolean;
  /**
   * Whether the update is mandatory: the app must not continue without updating.
   * @example true
   */
  shouldForceUpdate: boolean;
  /**
   * Why: `BELOW_MIN_SUPPORTED` (forced), `BELOW_LATEST` (optional), `UP_TO_DATE`, or `MODE_NONE` (update mode `none`).
   * @example "BELOW_MIN_SUPPORTED"
   */
  reason: "BELOW_MIN_SUPPORTED" | "BELOW_LATEST" | "UP_TO_DATE" | "MODE_NONE";
  /**
   * Server time of the check, in Unix epoch milliseconds.
   * @example 1700000000000
   */
  ts: number;
}

export interface VersionCheckResponseDto {
  /**
   * Always `success`.
   * @example "success"
   */
  status: string;
  /**
   * Human-readable result.
   * @example "Version check completed"
   */
  message: string;
  /** The update decision. */
  data: VersionCheckDataDto;
}

export interface NotificationItemDto {
  /**
   * The item.
   * @example "0192f3a4-5b6c-7d8e-9f01-23456789abcd"
   */
  id: string;
  /**
   * The catalog category.
   * @example "reaction.like"
   */
  category: string;
  /**
   * The title, in the language of the request.
   * @example "Someone liked your post"
   */
  title: string;
  /**
   * The text, in the language of the request.
   * @example "Minji and 2 other people liked a journey you posted."
   */
  body: string;
  /**
   * The screen to open. A route the app does not know opens home.
   * @example "/published/abc123"
   */
  route: string | null;
  /**
   * What the item is about.
   * @example "published_journey"
   */
  targetType: string | null;
  /**
   * The id of what the item is about.
   * @example "abc123"
   */
  targetId: string | null;
  /** The account to show. On a like item, the latest one who liked by the time of `occurredAt`. */
  actor: UserSummaryDto | null;
  /**
   * How many people the item is about right now. On a like item, the journey's likes up to `occurredAt`, so an older item stays with its own day.
   * @example 3
   */
  actorCount: number;
  /**
   * When the latest event of the item happened.
   * @format date-time
   * @example "2026-11-01T09:30:00.000Z"
   */
  occurredAt: string;
  /**
   * When the item was read. Null while unread.
   * @format date-time
   * @example null
   */
  readAt: string | null;
}

export interface NotificationInboxDto {
  /** The items, latest event first. */
  items: NotificationItemDto[];
  /**
   * Pass as `cursor` for the next page. Null on the last page.
   * @example null
   */
  nextCursor: string | null;
}

export interface UnreadNotificationCountDto {
  /**
   * Unread items.
   * @example 4
   */
  count: number;
}

export interface MarkNotificationsReadDto {
  /**
   * The items to mark read, up to 100.
   * @example ["0192f3a4-5b6c-7d8e-9f01-23456789abcd"]
   */
  ids?: string[];
  /**
   * True marks all of the caller's items read.
   * @example true
   */
  all?: boolean;
}

export interface MarkNotificationsReadResultDto {
  /**
   * How many items changed.
   * @example 2
   */
  updated: number;
}

export interface NotificationCategoryPreferenceDto {
  /**
   * The category.
   * @example "reaction.like"
   */
  category: string;
  /**
   * The settings group it is listed under.
   * @example "REACTIONS"
   */
  group: "MESSAGES" | "REACTIONS" | "PUBLISHING" | "FOLLOW" | "MEMORIES";
  /**
   * Whether it pushes.
   * @example true
   */
  enabled: boolean;
  /**
   * Who can trigger it. Null on a category with none to choose.
   * @example "EVERYONE"
   */
  audience: "EVERYONE" | "FOLLOWING" | null;
  /**
   * Whether `audience` can be changed.
   * @example true
   */
  audienceSelectable: boolean;
}

export interface NotificationQuietHoursDto {
  /**
   * Whether quiet hours apply.
   * @example false
   */
  enabled: boolean;
  /**
   * When they start, in minutes from midnight.
   * @example 1320
   */
  startMin: number;
  /**
   * When they end, in minutes from midnight.
   * @example 480
   */
  endMin: number;
  /**
   * Whether messages still push during them.
   * @example true
   */
  allowsMessages: boolean;
}

export interface NotificationPreferencesDto {
  /** Every category that can be changed. */
  categories: NotificationCategoryPreferenceDto[];
  /**
   * When the pause ends. Null when not paused.
   * @format date-time
   * @example null
   */
  pausedUntil: string | null;
  /** The quiet hours. */
  quietHours: NotificationQuietHoursDto;
}

export interface NotificationCategoryChangeDto {
  /**
   * The category to change, one `GET /core/notifications/preferences` lists.
   * @example "reaction.like"
   */
  category: string;
  /**
   * Whether the category pushes. Left out keeps it.
   * @example false
   */
  enabled?: boolean;
  /**
   * Who can trigger it, on a category with `audienceSelectable`. Left out keeps it.
   * @example "FOLLOWING"
   */
  audience?: "EVERYONE" | "FOLLOWING";
}

export interface NotificationQuietHoursChangeDto {
  /**
   * Whether quiet hours apply.
   * @example true
   */
  enabled?: boolean;
  /**
   * When they start, in minutes from midnight.
   * @min 0
   * @max 1439
   * @example 1320
   */
  startMin?: number;
  /**
   * When they end, in minutes from midnight.
   * @min 0
   * @max 1439
   * @example 480
   */
  endMin?: number;
  /**
   * Whether messages still push during them.
   * @example true
   */
  allowsMessages?: boolean;
}

export interface UpdateNotificationPreferencesDto {
  /** The categories to change. */
  categories?: NotificationCategoryChangeDto[];
  /**
   * Pauses every push that can be paused until then. Null ends a pause, and left out keeps it.
   * @format date-time
   * @example "2026-11-02T00:00:00.000Z"
   */
  pausedUntil?: string | null;
  /** The quiet hours to change. */
  quietHours?: NotificationQuietHoursChangeDto;
}

export interface RegisterPushDeviceDto {
  /**
   * The Expo push token of this install.
   * @example "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
   */
  pushToken: string;
  /**
   * The push service the token belongs to.
   * @example "EXPO"
   */
  provider: "EXPO";
  /**
   * The operating system of the device.
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID";
  /**
   * The operating system notification permission. `DENIED` and `UNDETERMINED` keep the device registered but it receives no push.
   * @example "GRANTED"
   */
  permission: "GRANTED" | "PROVISIONAL" | "DENIED" | "UNDETERMINED";
  /**
   * A random secret of at least 32 bytes in base64url or hex, generated by the app and stored before this request is sent. Only its hash is kept here. `POST /core/notifications/devices/unregister` needs it. Send the same one for the whole session and rotate it when the session ends: a new one replaces the old one, so a queued unregister from an earlier session cannot remove this registration.
   * @example "Hk3v2mZ0YqL8nXw5tR1sC7dP9bF4jG6aU2eN0oIyT3Q"
   */
  secret: string;
  /**
   * The language of the device. Omit to keep the stored value.
   * @example "ko-KR"
   */
  locale?: string;
  /**
   * The IANA time zone of the device, saved on the account. Omit to keep the stored value.
   * @example "Asia/Seoul"
   */
  timezone?: string;
  /**
   * The app version. Omit to keep the stored value.
   * @example "2.5.0"
   */
  appVersion?: string;
  /**
   * The FCM token this install registered before it moved to Expo. Its row is deleted, whichever account owns it, so the device does not receive a push twice.
   * @example "dXNlckBleGFtcGxlLmNvbQ:APA91bHPRgkF3JUikC4ENAHEeMrd41Zxv3hVZjC9KtT8"
   */
  replacesFcmToken?: string;
}

export interface PushDeviceDto {
  /**
   * The id of the install the request named.
   * @example "0192f3a4-5b6c-7d8e-9f01-23456789abcd"
   */
  installationId: string;
}

export interface UnregisterPushDeviceDto {
  /**
   * The id this install registered under (a UUID).
   * @example "0192f3a4-5b6c-7d8e-9f01-23456789abcd"
   */
  installationId: string;
  /**
   * The secret sent with the registration.
   * @example "Hk3v2mZ0YqL8nXw5tR1sC7dP9bF4jG6aU2eN0oIyT3Q"
   */
  secret: string;
}

export interface ArticleCoverImageDto {
  /**
   * URL of the first image embedded in the markdown body.
   * @format uri
   * @example "https://images.example.com/rio-carnival.jpg"
   */
  url: string;
  /**
   * Alt text of that image.
   * @example "Dancers in costume at a carnival parade"
   */
  alt: string;
}

export interface PublicArticleSummaryDto {
  /**
   * Article id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Language code the article is written in.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Locale of the article (for hreflang).
   * @example "en-US"
   */
  locale: string;
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * URL slug, unique within the language.
   * @example "rio-carnival-2026-guide"
   */
  slug: string;
  /**
   * Title.
   * @example "Rio Carnival 2026 Guide"
   */
  title: string;
  /**
   * Plain-text excerpt derived from the body (about 180 characters, cut at a sentence boundary); the title when the body has no text.
   * @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context."
   */
  summary: string;
  /** The first image embedded in the body; `null` when the body has none. */
  coverImage: ArticleCoverImageDto | null;
  /**
   * Estimated reading time in minutes (at least 1).
   * @example 6
   */
  readingTimeMinutes: number;
  /**
   * Byline; currently always `MomentBook Editorial`.
   * @example "MomentBook Editorial"
   */
  authorName: string;
  /**
   * When the article was published (its creation).
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  publishedAt: string;
  /**
   * When the article was last edited.
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  updatedAt: string;
}

export interface PublicArticlePageDto {
  /** Articles on this page, newest first. */
  items: PublicArticleSummaryDto[];
  /**
   * Total number of matching articles.
   * @example 42
   */
  total: number;
  /**
   * The page returned.
   * @example 1
   */
  page: number;
  /**
   * Articles per page.
   * @example 12
   */
  limit: number;
}

export interface ArticleAlternateDto {
  /**
   * Language code of this translation.
   * @example "ko"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Locale of this translation (for hreflang).
   * @example "ko-KR"
   */
  locale: string;
  /**
   * Slug of this translation (slugs differ per language).
   * @example "rio-carnival-2026-guide-ko"
   */
  slug: string;
  /**
   * Title of this translation.
   * @example "2026 리우 카니발 가이드"
   */
  title: string;
}

export interface PublicArticleDto {
  /**
   * Article id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Id shared by the translations of the same article (one article per language).
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId: string;
  /**
   * Language code the article is written in.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Locale of the article (for hreflang).
   * @example "en-US"
   */
  locale: string;
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * URL slug, unique within the language.
   * @example "rio-carnival-2026-guide"
   */
  slug: string;
  /**
   * Title.
   * @example "Rio Carnival 2026 Guide"
   */
  title: string;
  /**
   * Plain-text excerpt derived from the body (about 180 characters, cut at a sentence boundary); the title when the body has no text.
   * @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context."
   */
  summary: string;
  /**
   * Full article body in markdown. Embedded images use markdown image syntax.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
  /** The first image embedded in the body; `null` when the body has none. */
  coverImage: ArticleCoverImageDto | null;
  /**
   * Estimated reading time in minutes (at least 1).
   * @example 6
   */
  readingTimeMinutes: number;
  /**
   * Byline; currently always `MomentBook Editorial`.
   * @example "MomentBook Editorial"
   */
  authorName: string;
  /** The other languages of this article (same translation group), in supported-language order; empty when there are none. */
  alternates: ArticleAlternateDto[];
  /**
   * When the article was published (its creation).
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  publishedAt: string;
  /**
   * When the article was last edited.
   * @format date-time
   * @example "2026-04-06T08:10:00.000Z"
   */
  updatedAt: string;
}

export interface AdminArticleSummaryDto {
  /**
   * Article id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Language code the article is written in.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Locale of the article (for hreflang).
   * @example "en-US"
   */
  locale: string;
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * URL slug, unique within the language.
   * @example "rio-carnival-2026-guide"
   */
  slug: string;
  /**
   * Title.
   * @example "Rio Carnival 2026 Guide"
   */
  title: string;
  /**
   * Plain-text excerpt derived from the body (about 180 characters, cut at a sentence boundary); the title when the body has no text.
   * @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context."
   */
  summary: string;
  /** The first image embedded in the body; `null` when the body has none. */
  coverImage: ArticleCoverImageDto | null;
  /**
   * Estimated reading time in minutes (at least 1).
   * @example 6
   */
  readingTimeMinutes: number;
  /**
   * Byline; currently always `MomentBook Editorial`.
   * @example "MomentBook Editorial"
   */
  authorName: string;
  /**
   * When the article was published (its creation).
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  publishedAt: string;
  /**
   * When the article was last edited.
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  updatedAt: string;
  /**
   * Id shared by the translations of the same article (one article per language).
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId: string;
}

export interface AdminArticlePageDto {
  /** Articles on this page, most recently updated first. */
  items: AdminArticleSummaryDto[];
  /**
   * Total number of matching articles.
   * @example 12
   */
  total: number;
  /**
   * The page returned.
   * @example 1
   */
  page: number;
  /**
   * Articles per page.
   * @example 20
   */
  limit: number;
}

/** One article with its full markdown body and the other languages of its translation group. */
export interface AdminArticleDto {
  /**
   * Article id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Id shared by the translations of the same article (one article per language).
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId: string;
  /**
   * Language code the article is written in.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Locale of the article (for hreflang).
   * @example "en-US"
   */
  locale: string;
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * URL slug, unique within the language.
   * @example "rio-carnival-2026-guide"
   */
  slug: string;
  /**
   * Title.
   * @example "Rio Carnival 2026 Guide"
   */
  title: string;
  /**
   * Plain-text excerpt derived from the body (about 180 characters, cut at a sentence boundary); the title when the body has no text.
   * @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context."
   */
  summary: string;
  /**
   * Full article body in markdown. Embedded images use markdown image syntax.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
  /** The first image embedded in the body; `null` when the body has none. */
  coverImage: ArticleCoverImageDto | null;
  /**
   * Estimated reading time in minutes (at least 1).
   * @example 6
   */
  readingTimeMinutes: number;
  /**
   * Byline; currently always `MomentBook Editorial`.
   * @example "MomentBook Editorial"
   */
  authorName: string;
  /** The other languages of this article (same translation group), in supported-language order; empty when there are none. */
  alternates: ArticleAlternateDto[];
  /**
   * When the article was published (its creation).
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  publishedAt: string;
  /**
   * When the article was last edited.
   * @format date-time
   * @example "2026-04-06T08:10:00.000Z"
   */
  updatedAt: string;
}

export interface CreateAdminArticleRequestDto {
  /**
   * Translation group to add this article to, as a new language of an existing article (use that article's `translationGroupId`). Omit it to start a new group. Fixed after creation.
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId?: string;
  /**
   * Language code the article is written in (a code, not a locale). Fixed after creation.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * URL slug; generated from the title when omitted. Normalized (lowercased; runs of characters other than letters and digits become one `-`; at most 120 characters) and unique within the language. Fixed after creation.
   * @example "rio-carnival-2026-guide"
   */
  slug?: string;
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * Title (trimmed; must not be blank).
   * @example "Rio Carnival 2026 Guide"
   */
  title: string;
  /**
   * Markdown body (trimmed; must not be blank). Embedded images use standard markdown image syntax and need alt text and an absolute http(s) URL; the first one becomes the cover.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
}

export interface AdminArticleMutationResultDto {
  /**
   * Article id.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Id shared by the translations of the same article (one article per language).
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId: string;
  /**
   * Language code the article is written in.
   * @example "en"
   */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * URL slug, as stored (normalized).
   * @example "rio-carnival-2026-guide"
   */
  slug: string;
  /**
   * When the article was published (its creation).
   * @format date-time
   * @example "2026-04-06T07:30:00.000Z"
   */
  publishedAt: string;
  /**
   * When the article was last edited.
   * @format date-time
   * @example "2026-04-06T08:10:00.000Z"
   */
  updatedAt: string;
}

export interface UpdateAdminArticleRequestDto {
  /**
   * New editorial category.
   * @example "WELLBEING_GUIDE"
   */
  category?:
    | "FESTIVAL"
    | "TRAVEL_GUIDE"
    | "DESTINATION_GUIDE"
    | "WELLBEING_GUIDE";
  /**
   * New title (trimmed; must not be blank).
   * @example "Rio Carnival 2026 Planning Guide"
   */
  title?: string;
  /**
   * New markdown body (trimmed; must not be blank). Embedded images need alt text and an absolute http(s) URL.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body?: string;
}

export interface AdminArticleDeletionDto {
  /**
   * Id of the deleted article.
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  articleId: string;
  /**
   * Always `true`.
   * @example true
   */
  deleted: boolean;
}

export interface AdminAuditLogItemDto {
  /**
   * Log row id.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  id: string;
  /**
   * What the admin did.
   * @example "USER_BANNED"
   */
  action:
    | "USER_BANNED"
    | "USER_UNBANNED"
    | "USER_SESSIONS_REVOKED"
    | "JOURNEY_REVIEW_DECIDED"
    | "JOURNEY_PUBLISHED_UNTRANSLATED"
    | "JOURNEY_TRANSLATION_REQUEUED"
    | "REPORT_UPDATED"
    | "COMMENT_DELETED"
    | "ARTICLE_CREATED"
    | "ARTICLE_UPDATED"
    | "ARTICLE_DELETED";
  /**
   * Kind of the thing acted on.
   * @example "USER"
   */
  targetType: "USER" | "PUBLISHED_JOURNEY" | "REPORT" | "COMMENT" | "ARTICLE";
  /**
   * Id of the target: a user id, a journey public id, a report id, a comment id or an article id.
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  targetId: string;
  /**
   * Account the action concerns (banned user, journey owner, comment author); `null` when none, such as articles.
   * @format uuid
   * @example "0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"
   */
  subjectUserId: string | null;
  /**
   * Free-text admin note; `null` when none was given.
   * @example "Repeated harassment"
   */
  reason: string | null;
  /**
   * Ids and state values of the action, never content. By action: `USER_BANNED` `{previousStatus, reportId?}`; `USER_UNBANNED` `{resultingStatus, reportId?}`; `USER_SESSIONS_REVOKED` `{revokedSessions}`; `JOURNEY_REVIEW_DECIDED` `{from, to, publishOperationId, requestedAt}`; `JOURNEY_PUBLISHED_UNTRANSLATED` `{publishOperationId}`; `JOURNEY_TRANSLATION_REQUEUED` `{dispatched}`; `REPORT_UPDATED` `{fromStatus, toStatus, adminNoteChanged}`; `COMMENT_DELETED` `{publicId}`; `ARTICLE_CREATED`, `ARTICLE_UPDATED` and `ARTICLE_DELETED` `{language, slug}`.
   * @example {"previousStatus":"ACTIVE","reportId":"0199a1b2-7d8e-7f01-9a2b-3c4d5e6f7a8b"}
   */
  details: Record<string, any>;
  /**
   * When the action was taken.
   * @format date-time
   * @example "2026-10-01T09:30:00.000Z"
   */
  createdAt: string;
  /** The admin who acted; `null` if the account no longer exists. */
  actor: AdminUserSummaryDto | null;
  /** The affected account; `null` when `subjectUserId` is `null` or the account no longer exists. */
  subject: AdminUserSummaryDto | null;
}

export interface AdminAuditLogPageDto {
  /** The page of admin actions, newest first. */
  items: AdminAuditLogItemDto[];
  /**
   * Actions matching the filters.
   * @example 134
   */
  total: number;
  /**
   * Current page, 1-based.
   * @example 1
   */
  page: number;
  /**
   * Rows per page.
   * @example 20
   */
  limit: number;
}

export interface AdminMetricsDailyDto {
  /**
   * The UTC day, `YYYY-MM-DD`. Days are UTC calendar days.
   * @example "2026-10-22"
   */
  date: string;
  /**
   * Accounts created that day with role USER (including ones banned or deleted since; guests have no row). Days are UTC calendar days.
   * @example 12
   */
  signups: number;
  /**
   * Distinct accounts that signed in or refreshed their token that day, counted from refresh-token rows (`auths`). An approximation: a refresh only happens after the access token expires (2h by default). Rows are deleted once the refresh token expires (30d by default), so days older than that are `null`. Days are UTC calendar days.
   * @example 87
   */
  activeAccounts: number | null;
  /**
   * Currently published journeys whose first publish time falls on that day. Days are UTC calendar days. Counted from rows that still exist, so deleted or expired rows are missing.
   * @example 5
   */
  newPublishedJourneys: number;
  /**
   * Review decisions (approve or reject) recorded in the admin action log that day; moves back to pending are not counted. Accurate only from the day the audit log was deployed. Days are UTC calendar days.
   * @example 4
   */
  reviewDecisions: number;
  /**
   * Reports filed that day. Days are UTC calendar days. Counted from rows that still exist, so deleted or expired rows are missing.
   * @example 3
   */
  reportsOpened: number;
  /**
   * Reports closed (resolved or rejected) that day, by resolution time. Days are UTC calendar days. Counted from rows that still exist, so deleted or expired rows are missing.
   * @example 2
   */
  reportsClosed: number;
  /**
   * Comments created that day, whatever their status now. Days are UTC calendar days. Counted from rows that still exist, so deleted or expired rows are missing.
   * @example 21
   */
  commentsCreated: number;
}

export interface AdminMetricsUsersDto {
  /**
   * All accounts (every role), the sum of the four statuses.
   * @example 1500
   */
  total: number;
  /**
   * Accounts with status ACTIVE.
   * @example 1200
   */
  active: number;
  /**
   * Accounts with status INACTIVE (signup not completed).
   * @example 250
   */
  inactive: number;
  /**
   * Accounts with status BANNED.
   * @example 10
   */
  banned: number;
  /**
   * Accounts with status DELETED.
   * @example 40
   */
  deleted: number;
}

export interface AdminMetricsReviewsDto {
  /**
   * Published journeys whose review is PENDING.
   * @example 7
   */
  pending: number;
  /**
   * Oldest wait among the pending journeys: the earliest review request time, falling back to the last update time for rows without one. Null when nothing is pending.
   * @format date-time
   * @example "2026-10-22T09:30:00.000Z"
   */
  oldestPendingAt: string | null;
  /**
   * Published journeys still waiting for their translations (`reviewLocalizationPending`).
   * @example 1
   */
  localizationPending: number;
  /**
   * Published journeys whose translation request could not be queued (`reviewEnqueueFailed`).
   * @example 0
   */
  enqueueFailed: number;
  /**
   * Median seconds from review request to decision, over approve or reject decisions in the window that recorded the request time. Null when there are none.
   * @example 5400
   */
  medianDecisionSeconds: number | null;
}

export interface AdminMetricsReportsDto {
  /**
   * Reports still to close: pending plus reviewed.
   * @example 9
   */
  open: number;
  /**
   * Reports with status PENDING.
   * @example 6
   */
  pending: number;
  /**
   * Reports with status REVIEWED.
   * @example 3
   */
  reviewed: number;
  /**
   * Median seconds from filing to closing, over reports closed in the window. Reports closed by the retired automation (`system:auto`) are excluded. Null when there are none.
   * @example 86400
   */
  medianCloseSeconds: number | null;
}

export interface AdminMetricsOperationsDto {
  /**
   * Notification jobs that exhausted their retries (status DEAD) and have not yet expired. Needs an engineer, not an admin.
   * @example 0
   */
  notificationJobsDead: number;
  /**
   * Published journeys whose storage cleanup after unpublish FAILED.
   * @example 0
   */
  unpublishCleanupFailed: number;
  /**
   * Deleted accounts whose final erasure pass is more than 30 minutes overdue.
   * @example 0
   */
  erasureOverdue: number;
}

export interface AdminMetricsDto {
  /**
   * When the figures were computed.
   * @format date-time
   * @example "2026-10-22T09:30:00.000Z"
   */
  generatedAt: string;
  /**
   * First day of the window (UTC), `YYYY-MM-DD`.
   * @example "2026-09-23"
   */
  from: string;
  /**
   * Last day of the window (UTC, today), `YYYY-MM-DD`.
   * @example "2026-10-22"
   */
  to: string;
  /**
   * Number of days in the window.
   * @example 30
   */
  days: number;
  /** One entry per day, oldest first, exactly `days` long; days without events are 0. */
  daily: AdminMetricsDailyDto[];
  /** Accounts by status, over all time. */
  users: AdminMetricsUsersDto;
  /** Publication review queue snapshot. */
  reviews: AdminMetricsReviewsDto;
  /** Report queue snapshot. */
  reports: AdminMetricsReportsDto;
  /** Counts that need an engineer, not an admin action. */
  operations: AdminMetricsOperationsDto;
}

export interface AdminNotificationSkipDto {
  /**
   * Why the notice was not pushed, as the delivery policy records it (`holdout`, `weekly_cap`, `engagement_fatigue`, `category_off`, `no_device`, `daily_cap`, `ttl_expired` and so on). `unrecorded` for a skip without one.
   * @example "weekly_cap"
   */
  reason: string;
  /**
   * Notices skipped for that reason in the window.
   * @example 4
   */
  jobs: number;
}

export interface AdminNotificationCategoryMetricsDto {
  /**
   * The catalog category.
   * @example "memories.on_this_day"
   */
  category: string;
  /**
   * The settings group. Null for a category with no toggle.
   * @example "MEMORIES"
   */
  group: "MESSAGES" | "REACTIONS" | "PUBLISHING" | "FOLLOW" | "MEMORIES" | null;
  /**
   * `ENGAGEMENT` categories are off until the account turns them on, and are the ones the holdout measures.
   * @example "ENGAGEMENT"
   */
  legalClass: "SERVICE" | "ENGAGEMENT" | "AD";
  /**
   * Whether the category pushes for an account that never set it.
   * @example false
   */
  defaultEnabled: boolean;
  /**
   * Pushes handed to the provider in the window, one per device (an account holds one device). Push records are kept 30 days, so a longer window counts only those.
   * @example 120
   */
  sent: number;
  /**
   * Of the pushes created in the window, those the provider confirmed (`ACCEPTED`).
   * @example 117
   */
  delivered: number;
  /**
   * Of the pushes created in the window, those the app reported opened.
   * @example 31
   */
  opened: number;
  /**
   * Of the pushes created in the window, those that `FAILED`.
   * @example 2
   */
  failed: number;
  /** Notices that ended without a push in the window, by reason, the most frequent first. */
  skipped: AdminNotificationSkipDto[];
  /**
   * Active accounts that turned the category on. An account that never changed it has no row and follows `defaultEnabled`, so for a category on by default this counts only explicit choices.
   * @example 40
   */
  optedIn: number;
  /**
   * Active accounts that turned the category off (an explicit choice), at any time.
   * @example 12
   */
  optedOut: number;
  /**
   * Of `optedOut`, those whose setting last changed in the window.
   * @example 3
   */
  optedOutInWindow: number;
}

export interface AdminNotificationPermissionDto {
  /** Device platform. */
  platform: "IOS" | "ANDROID" | "UNKNOWN";
  /** The notification permission the app last reported. */
  permission: "GRANTED" | "PROVISIONAL" | "DENIED" | "UNDETERMINED";
  /**
   * Registered devices of active accounts, now.
   * @example 85
   */
  devices: number;
}

export interface AdminNotificationRetentionDto {
  /**
   * An `ENGAGEMENT` category.
   * @example "memories.on_this_day"
   */
  category: string;
  /** `TARGET`: accounts whose first notice of the category reached a device. `HOLDOUT`: accounts held out (one in ten, fixed per account) whose first notice ended `holdout` at the same point of the policy. */
  cohort: "TARGET" | "HOLDOUT";
  /**
   * Accounts in the cohort, by their first such notice still kept (notices are kept 90 days). Not limited to the window.
   * @example 200
   */
  accounts: number;
  /**
   * Of `accounts`, those whose 7 days after that notice (counted from its UTC day) are over.
   * @example 180
   */
  d7Eligible: number;
  /**
   * Of `d7Eligible`, those with an active day (`UserActiveDay`, the account's local day) in the 7 days after the notice, not counting the notice day.
   * @example 70
   */
  d7Returned: number;
  /**
   * Of `accounts`, those whose 30 days after that notice are over.
   * @example 120
   */
  d30Eligible: number;
  /**
   * Of `d30Eligible`, those active on a day in the 30 days after the notice.
   * @example 66
   */
  d30Returned: number;
}

export interface AdminNotificationMetricsDto {
  /**
   * When the figures were computed.
   * @format date-time
   * @example "2026-10-22T09:30:00.000Z"
   */
  generatedAt: string;
  /**
   * First day of the window (UTC), `YYYY-MM-DD`.
   * @example "2026-09-23"
   */
  from: string;
  /**
   * Last day of the window (UTC, today), `YYYY-MM-DD`.
   * @example "2026-10-22"
   */
  to: string;
  /**
   * Number of days in the window.
   * @example 30
   */
  days: number;
  /** Every catalog category once, in catalog order, zeros included. */
  categories: AdminNotificationCategoryMetricsDto[];
  /** Devices by platform and permission, now. */
  permissions: AdminNotificationPermissionDto[];
  /** Return after a first engagement notice, target against holdout, by category; a cohort with no account has no entry. The audience widens only when the target returns more by day 30 than the holdout and opt-outs do not rise (ADR-0096). */
  retention: AdminNotificationRetentionDto[];
}

export interface ApiErrorResponseDto {
  /**
   * The HTTP status code, repeated in the body.
   * @example 400
   */
  statusCode: number;
  /**
   * Machine-readable reason; branch on this and `statusCode`. `null` on an error with no code (framework validation, a missing token, an unexpected 500).
   * @example "AUTH_RATE_LIMIT_EXCEEDED"
   */
  errorCode: string | null;
  /**
   * Human-readable explanation for logs and debugging. Its wording (English or Korean) is not a contract — branch on `statusCode` and `errorCode`, never on this text. Validation failures join every violated rule with ", ".
   * @example "property foo should not exist"
   */
  message: string;
}
