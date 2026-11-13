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

/** Google Sign-In result. Send at least one of `idToken` / `accessToken`; when both are sent only `idToken` is used. */
export interface GoogleTokenAuthDto {
  /**
   * Google OAuth access token. Must have been issued to one of MomentBook's Google OAuth clients (web, iOS or Android). Ignored when `idToken` is also sent.
   * @example "ya29.a0AfB_byC1x2y3z4ExampleAccessToken0123456789"
   */
  accessToken?: string;
  /**
   * Google ID token (RS256 JWT). Its `aud` must be one of MomentBook's Google OAuth clients (web, iOS or Android) and its `iss` Google's. Preferred over `accessToken`.
   * @example "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFmNDBmMGE4ZWYzZDg4MDk3OGRjODJmMjVjM2VjMzE3YzZhNWI3ODEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMTA2MTU1MjM0NTY3ODkwMTIzNDUifQ.c2lnbmF0dXJl"
   */
  idToken?: string;
}

export interface AuthUserDto {
  /**
   * Account id (UUID).
   * @format uuid
   * @example "0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b"
   */
  id: string;
  /**
   * Display name. Always present; null when the account has none yet (e.g. a fresh passkey signup).
   * @example "홍길동"
   */
  name: string | null;
  /**
   * The account's representative (contact) email. Always present; null when the account has none.
   * @format email
   * @example "user@example.com"
   */
  email: string | null;
  /**
   * Profile picture URL. Always present; null when unset.
   * @example "https://cdn.momentbook.app/profiles/0199a1b2-3c4d-7e5f-8a9b-0c1d2e3f4a5b/avatar.jpg"
   */
  picture: string | null;
  /**
   * Always `false` for a sign-in response (guest sessions are never issued here).
   * @example false
   */
  isGuest: boolean;
}

export interface ConsentStatusDto {
  /**
   * Whether the account has accepted every required consent. `false` for a new or not-yet-activated account.
   * @example false
   */
  isAllRequiredConsented: boolean;
  /**
   * Keys of the required consent templates the account has not accepted yet (empty when `isAllRequiredConsented` is true).
   * @example ["terms_of_service","privacy_policy"]
   */
  missingRequiredConsents: string[];
  /**
   * Always sent; the negation of `isAllRequiredConsented`. When true, route the user to the consent screen, submit `POST /core/users/consents`, then refresh the token pair to activate the account.
   * @example true
   */
  requiresAction: boolean;
}

export interface AuthSessionDto {
  /** The signed-in account. */
  user: AuthUserDto;
  /**
   * The sign-in method used for this request (uppercase): `GOOGLE`, `APPLE`, `EMAIL` (password or email code) or `PASSKEY`.
   * @example "GOOGLE"
   */
  provider: "GOOGLE" | "APPLE" | "EMAIL" | "PASSKEY";
  /**
   * RS256 access token. Send it as `Authorization: Bearer <accessToken>`.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJpc0d1ZXN0IjpmYWxzZSwidiI6MywiaWF0IjoxNzkxNDE3NjAwLCJleHAiOjE3OTE0MjQ4MDB9.zv2PQ1XQREBOnYrpNEWJuZ1l6EWrOYZbx7r5UHRjvJdWzjzFUqYU2HmXzMuF5FXr"
   */
  accessToken: string;
  /**
   * Single-use refresh token. Exchange it at `POST /auth/refresh`; store the new one returned there. Revoke it with `POST /auth/logout`.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJ0eXBlIjoicmVmcmVzaCIsImlzR3Vlc3QiOmZhbHNlLCJ2IjozLCJpYXQiOjE3OTE0MTc2MDAsImV4cCI6MTc5NDAwOTYwMH0.fJa5XRZ4SHxP_G1i1diTUBNnCu0tY43hkPU8lpMHJNTPPoyAsqAAXyFVY8amKCh4"
   */
  refreshToken: string;
  /**
   * Access token lifetime in seconds (server-configured — use this value instead of assuming a fixed lifetime).
   * @example 7200
   */
  expiresIn: number;
  /** The account's required-consent state. */
  consents: ConsentStatusDto;
  /**
   * True when this sign-in created the account. `POST /auth/passkey/register/verify` is `false` when the passkey was added to the signed-in account; email sign-in and `POST /auth/passkey/login/verify` never create one and are always `false`.
   * @example false
   */
  created: boolean;
}

export interface AppleFullName {
  /**
   * Given (first) name.
   * @example "길동"
   */
  givenName?: string;
  /**
   * Family (last) name.
   * @example "홍"
   */
  familyName?: string;
}

/** Sign in with Apple result, in the iOS (`identityToken`, `authorizationCode`, …) or the Android/web (`id_token`, `code`, …) field naming. Required: an identity token (`identityToken` or `id_token`) AND an authorization code (`authorizationCode` or `code`); everything else is optional. */
export interface AppleAuthDto {
  /**
   * Apple identity token (iOS naming). Takes precedence over `id_token`; its presence also makes the platform default to iOS.
   * @example "eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwic3ViIjoiMDAwMTIzLmFiYzQ1NmRlZjc4OS4wMTIzIn0.c2lnbmF0dXJl"
   */
  identityToken?: string;
  /**
   * Apple authorization code (iOS naming). Required (or `code`). After the sign-in, and when the server is configured for it, exchanged with Apple for a refresh token kept to revoke the grant when the account is deleted; a failed exchange does not fail the sign-in.
   * @example "c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.0.mrqtu.Ab1Cd2Ef3Gh4Ij5Kl6Mn7O"
   */
  authorizationCode?: string;
  /**
   * Apple user identifier as reported by the SDK (iOS). Accepted but ignored — the account is identified by the verified token `sub`.
   * @example "000123.abc456def7890123456789abcdef01.0123"
   */
  user?: string;
  /** Name from Apple, provided only on the first authorization. Used to build the account name (family name + given name). */
  fullName?: AppleFullName;
  /**
   * Email reported by the SDK (first authorization only). Unverified: used only to derive a display name when `fullName` is absent and the token carries no email; never stored as the account email.
   * @example "abc123def4@privaterelay.appleid.com"
   */
  email?: string;
  /**
   * Apple identity token (Android/web naming). Used when `identityToken` is absent.
   * @example "eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwic3ViIjoiMDAwMTIzLmFiYzQ1NmRlZjc4OS4wMTIzIn0.c2lnbmF0dXJl"
   */
  id_token?: string;
  /**
   * Apple authorization code (Android/web naming). Used when `authorizationCode` is absent, and handled the same way.
   * @example "c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.0.mrqtu.Ab1Cd2Ef3Gh4Ij5Kl6Mn7O"
   */
  code?: string;
  /**
   * The raw (un-hashed) nonce the app gave the Apple SDK. When sent, the identity token's `nonce` claim must equal SHA-256(nonce) as hex, or the request fails with 401. When it is not sent and the token carries a `nonce` claim, the server's setting decides whether the sign-in is accepted or fails with 401.
   * @example "b5f1c0a3e9d84c27a6f2e1d0c9b8a7f6"
   */
  nonce?: string;
  /**
   * OAuth `state` from the Android/web flow. Accepted but ignored.
   * @example "a1b2c3d4e5"
   */
  state?: string;
  /**
   * Client platform; selects the Apple audience (`IOS` → app bundle id, `ANDROID`/`WEB` → Services ID). Defaults to iOS when `identityToken` is sent, else to the `X-Platform` header, else Android.
   * @example "IOS"
   */
  platform?: "IOS" | "ANDROID" | "WEB";
}

export interface RefreshTokenDto {
  /**
   * The current refresh token (from a sign-in or the previous refresh). Consumed by this call.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJ0eXBlIjoicmVmcmVzaCIsImlzR3Vlc3QiOmZhbHNlLCJ2IjozLCJpYXQiOjE3OTE0MTc2MDAsImV4cCI6MTc5NDAwOTYwMH0.fJa5XRZ4SHxP_G1i1diTUBNnCu0tY43hkPU8lpMHJNTPPoyAsqAAXyFVY8amKCh4"
   */
  refreshToken: string;
}

export interface TokenPairDto {
  /**
   * RS256 access token. Send it as `Authorization: Bearer <accessToken>`.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJpc0d1ZXN0IjpmYWxzZSwidiI6MywiaWF0IjoxNzkxNDE3NjAwLCJleHAiOjE3OTE0MjQ4MDB9.zv2PQ1XQREBOnYrpNEWJuZ1l6EWrOYZbx7r5UHRjvJdWzjzFUqYU2HmXzMuF5FXr"
   */
  accessToken: string;
  /**
   * The replacement refresh token. The one sent in the request is consumed — store this one.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJ0eXBlIjoicmVmcmVzaCIsImlzR3Vlc3QiOmZhbHNlLCJ2IjozLCJpYXQiOjE3OTE0MTc2MDAsImV4cCI6MTc5NDAwOTYwMH0.fJa5XRZ4SHxP_G1i1diTUBNnCu0tY43hkPU8lpMHJNTPPoyAsqAAXyFVY8amKCh4"
   */
  refreshToken: string;
  /**
   * Access token lifetime in seconds (server-configured — use this value instead of assuming a fixed lifetime).
   * @example 7200
   */
  expiresIn: number;
}

export interface LogoutDto {
  /**
   * The current session's refresh token to revoke. Only this refresh token is revoked; access tokens expire naturally.
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTk5YTFiMi0zYzRkLTdlNWYtOGE5Yi0wYzFkMmUzZjRhNWIiLCJ0eXBlIjoicmVmcmVzaCIsImlzR3Vlc3QiOmZhbHNlLCJ2IjozLCJpYXQiOjE3OTE0MTc2MDAsImV4cCI6MTc5NDAwOTYwMH0.fJa5XRZ4SHxP_G1i1diTUBNnCu0tY43hkPU8lpMHJNTPPoyAsqAAXyFVY8amKCh4"
   */
  refreshToken: string;
}

export interface EmailLoginDto {
  /**
   * The email login address (matched case-insensitively, surrounding spaces ignored).
   * @format email
   * @example "user@example.com"
   */
  email: string;
  /**
   * The account password (any non-empty string).
   * @format password
   * @example "correct-horse-battery-staple"
   */
  password: string;
}

export interface SendEmailOtpDto {
  /**
   * The address to send the sign-in code to (trimmed and lowercased server-side).
   * @format email
   * @example "user@example.com"
   */
  email: string;
}

export interface EmailOtpChallengeDto {
  /**
   * Seconds until the issued code expires.
   * @example 600
   */
  expiresIn: number;
  /**
   * Seconds until another code can be requested for this address; an earlier request gets 429 `EMAIL_OTP_RESEND_COOLDOWN`.
   * @example 60
   */
  resendAvailableIn: number;
}

export interface VerifyEmailOtpDto {
  /**
   * The address the code was sent to (trimmed and lowercased server-side).
   * @format email
   * @example "user@example.com"
   */
  email: string;
  /**
   * The 6-digit code from the email.
   * @minLength 6
   * @maxLength 6
   * @pattern ^\d{6}$
   * @example "482913"
   */
  code: string;
}

export interface RequestEmailChangeDto {
  /**
   * The new representative email; the code is sent here. Trimmed and lowercased server-side.
   * @format email
   * @example "new-address@example.com"
   */
  newEmail: string;
}

export interface ConfirmEmailChangeDto {
  /**
   * The same new address as in the request step (trimmed and lowercased server-side).
   * @format email
   * @example "new-address@example.com"
   */
  newEmail: string;
  /**
   * The 6-digit code from the email.
   * @minLength 6
   * @maxLength 6
   * @pattern ^\d{6}$
   * @example "482913"
   */
  code: string;
}

export interface EmailAddressDto {
  /**
   * The address that was committed, lowercase.
   * @format email
   * @example "new-address@example.com"
   */
  email: string;
}

export interface RequestEmailCredentialDto {
  /**
   * The address to enroll as a login email; the code is sent here. Trimmed and lowercased server-side.
   * @format email
   * @example "login-address@example.com"
   */
  email: string;
}

export interface ConfirmEmailCredentialDto {
  /**
   * The same address as in the request step (trimmed and lowercased server-side).
   * @format email
   * @example "login-address@example.com"
   */
  email: string;
  /**
   * The 6-digit code from the email.
   * @minLength 6
   * @maxLength 6
   * @pattern ^\d{6}$
   * @example "482913"
   */
  code: string;
}

export interface EmailCredentialDto {
  /**
   * The enrolled login address (lowercase). Pass it unchanged — URL-encoded — as the path parameter of `DELETE /auth/email-credential/{email}`.
   * @format email
   * @example "login-address@example.com"
   */
  email: string;
  /**
   * When the address was enrolled as a login credential.
   * @format date-time
   * @example "2026-09-30T08:15:00.000Z"
   */
  createdAt: string;
  /**
   * Last sign-in with this address; null if never used.
   * @format date-time
   * @example "2026-10-07T21:03:12.000Z"
   */
  lastUsedAt: string | null;
  /**
   * True when the account has exactly one sign-in method in total (passkeys, email credentials, Google/Apple identities and a password all count) — the same value on every row. Deleting would then be refused with 409, so disable the delete action. A UI hint only; the delete re-checks.
   * @example false
   */
  isLastSignInMethod: boolean;
}

export interface EmailCredentialListDto {
  /** The caller's email login credentials, newest first. */
  items: EmailCredentialDto[];
}

export interface PasskeyRelyingPartyDto {
  /**
   * Relying party id (the domain passkeys are bound to).
   * @example "momentbook.app"
   */
  id: string;
  /**
   * Relying party name shown by some authenticators.
   * @example "momentbook"
   */
  name: string;
}

export interface PasskeyUserEntityDto {
  /**
   * WebAuthn user handle, base64url. Derived from the account id for a signed-in caller (stable, so re-registering the same authenticator replaces its passkey); random for an anonymous signup.
   * @example "AZmhsjxNfl-KmwwdLj9KWw"
   */
  id: string;
  /**
   * Label shown in the platform passkey picker: the account's contact email, else its name, else `momentbook` (always `momentbook` for an anonymous signup).
   * @example "user@example.com"
   */
  name: string;
  /**
   * The account's name; empty string when it has none (always empty for an anonymous signup).
   * @example "홍길동"
   */
  displayName: string;
}

export interface PasskeyPublicKeyCredentialParamDto {
  /**
   * COSE algorithm identifier. The server offers -8 (EdDSA), -7 (ES256) and -257 (RS256), in that order.
   * @example -7
   */
  alg: number;
  /**
   * Always `public-key`.
   * @example "public-key"
   */
  type: "public-key";
}

export interface PasskeyCredentialDescriptorDto {
  /**
   * Credential id, base64url.
   * @example "xV3hQk2LrN8yTzP0aWcD6mFu9Jg"
   */
  id: string;
  /**
   * Always `public-key`.
   * @example "public-key"
   */
  type: "public-key";
  /**
   * Transports the authenticator reported when this passkey was registered (may be empty).
   * @example ["internal","hybrid"]
   */
  transports?: (
    | "ble"
    | "cable"
    | "hybrid"
    | "internal"
    | "nfc"
    | "smart-card"
    | "usb"
  )[];
}

export interface PasskeyAuthenticatorSelectionDto {
  /**
   * Currently always `platform`: registration is limited to the built-in platform authenticator (iCloud Keychain, Google Password Manager).
   * @example "platform"
   */
  authenticatorAttachment: "platform" | "cross-platform";
  /**
   * Currently always `required` — a discoverable credential, needed for usernameless sign-in.
   * @example "required"
   */
  residentKey: "required" | "preferred" | "discouraged";
  /**
   * Legacy mirror of `residentKey === "required"`.
   * @example true
   */
  requireResidentKey: boolean;
  /**
   * Currently always `preferred`.
   * @example "preferred"
   */
  userVerification: "required" | "preferred" | "discouraged";
}

export interface PasskeyRegistrationExtensionsDto {
  /**
   * Always `true`: asks the client to report credential properties.
   * @example true
   */
  credProps: boolean;
}

/** WebAuthn `PublicKeyCredentialCreationOptionsJSON` plus `sessionKey` — pass the WebAuthn fields to `navigator.credentials.create()` / the native passkey API unchanged. */
export interface PasskeyRegistrationOptionsDto {
  /**
   * Ceremony id. Send it back unchanged as `sessionKey` to `POST /auth/passkey/register/verify` within 120 seconds; it is single-use.
   * @example "sczkVEOwKMY0Kr947uYM5w"
   */
  sessionKey: string;
  /**
   * Challenge (32 random bytes), base64url.
   * @example "Tpr4knCRVYZy1upmmCaeAA-xDp_m4jW36qh_6Soh09Q"
   */
  challenge: string;
  /** Relying party. */
  rp: PasskeyRelyingPartyDto;
  /** The account the passkey is created for. */
  user: PasskeyUserEntityDto;
  /** Accepted key algorithms, most preferred first. */
  pubKeyCredParams: PasskeyPublicKeyCredentialParamDto[];
  /**
   * Ceremony timeout hint for the authenticator, in milliseconds.
   * @example 60000
   */
  timeout: number;
  /**
   * Currently always `none` (no attestation is requested).
   * @example "none"
   */
  attestation: "none" | "indirect" | "direct" | "enterprise";
  /** The signed-in account's existing passkeys, so the authenticator does not register a second one; empty for an anonymous signup. */
  excludeCredentials: PasskeyCredentialDescriptorDto[];
  /** Authenticator requirements. */
  authenticatorSelection: PasskeyAuthenticatorSelectionDto;
  /** Requested WebAuthn extensions. */
  extensions: PasskeyRegistrationExtensionsDto;
  /**
   * Authenticator hints; currently always empty.
   * @example []
   */
  hints: ("security-key" | "client-device" | "hybrid")[];
}

/** Completes a passkey registration started by `POST /auth/passkey/register/options`. Send the same bearer token (or none) as on the options call. */
export interface PasskeyRegisterVerifyDto {
  /**
   * The WebAuthn `RegistrationResponseJSON` produced by `navigator.credentials.create()` or the native passkey API, passed through unchanged: `{ id, rawId, type: "public-key", response: { clientDataJSON, attestationObject, transports?, ... }, clientExtensionResults, authenticatorAttachment? }` with byte fields as base64url. Only checked to be an object here; a malformed or unverifiable value is a 400.
   * @example {"id":"xV3hQk2LrN8yTzP0aWcD6mFu9Jg","rawId":"xV3hQk2LrN8yTzP0aWcD6mFu9Jg","type":"public-key","response":{"clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiVHByNGtuQ1JWWVp5MXVwbW1DYWVBQS14RHBfbTRqVzM2cWhfNlNvaDA5USIsIm9yaWdpbiI6Imh0dHBzOi8vbW9tZW50Ym9vay5hcHAifQ","attestationObject":"o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVi...","transports":["internal","hybrid"]},"clientExtensionResults":{"credProps":{"rk":true}},"authenticatorAttachment":"platform"}
   */
  response: Record<string, any>;
  /**
   * The `sessionKey` returned by `POST /auth/passkey/register/options` (single-use, expires 120 seconds after issue).
   * @example "sczkVEOwKMY0Kr947uYM5w"
   */
  sessionKey: string;
  /**
   * Platform of the registering client, stored with the passkey for the management UI.
   * @example "IOS"
   */
  platform?: "IOS" | "ANDROID" | "WEB";
  /**
   * Human-readable device name stored with the passkey for the management UI (no length limit).
   * @example "iPhone 15 Pro"
   */
  deviceLabel?: string;
  /**
   * Client-chosen identifier of this app install/device (ADR-0049), max 128 characters. Self-reported and never verified — used only to group passkeys in the management UI, never for authorization.
   * @maxLength 128
   * @example "f3a1c9e2-7b4d-4e8a-9c21-5d6e7f8a9b0c"
   */
  deviceId?: string;
}

/** WebAuthn `PublicKeyCredentialRequestOptionsJSON` plus `sessionKey` — pass the WebAuthn fields to `navigator.credentials.get()` / the native passkey API unchanged. Usernameless: there is no `allowCredentials`, so the platform offers every discoverable passkey for the relying party. */
export interface PasskeyAuthenticationOptionsDto {
  /**
   * Ceremony id. Send it back unchanged as `sessionKey` to `POST /auth/passkey/login/verify` within 120 seconds; it is single-use.
   * @example "sczkVEOwKMY0Kr947uYM5w"
   */
  sessionKey: string;
  /**
   * Relying party id.
   * @example "momentbook.app"
   */
  rpId: string;
  /**
   * Challenge (32 random bytes), base64url.
   * @example "Tpr4knCRVYZy1upmmCaeAA-xDp_m4jW36qh_6Soh09Q"
   */
  challenge: string;
  /**
   * Ceremony timeout hint for the authenticator, in milliseconds.
   * @example 60000
   */
  timeout: number;
  /**
   * Currently always `preferred`.
   * @example "preferred"
   */
  userVerification: "required" | "preferred" | "discouraged";
}

export interface PasskeyLoginVerifyDto {
  /**
   * The WebAuthn `AuthenticationResponseJSON` produced by `navigator.credentials.get()` or the native passkey API, passed through unchanged: `{ id, rawId, type: "public-key", response: { clientDataJSON, authenticatorData, signature, userHandle? }, clientExtensionResults, authenticatorAttachment? }` with byte fields as base64url. `id` must be a non-empty string; every verification failure is the same 401 `PASSKEY_UNKNOWN_CREDENTIAL`.
   * @example {"id":"xV3hQk2LrN8yTzP0aWcD6mFu9Jg","rawId":"xV3hQk2LrN8yTzP0aWcD6mFu9Jg","type":"public-key","response":{"clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiVHByNGtuQ1JWWVp5MXVwbW1DYWVBQS14RHBfbTRqVzM2cWhfNlNvaDA5USIsIm9yaWdpbiI6Imh0dHBzOi8vbW9tZW50Ym9vay5hcHAifQ","authenticatorData":"SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA","signature":"MEUCIQDdP0x8hE6p3wZ9b4cS2nYQ1hW8l0K3v5bF6m7tJ0aXGQIgV9o2c4r5s6t7u8v9w0x1y2z3A4B5C6D7E8F9G0H1I2J","userHandle":"AZmhsjxNfl-KmwwdLj9KWw"},"clientExtensionResults":{},"authenticatorAttachment":"platform"}
   */
  response: Record<string, any>;
  /**
   * The `sessionKey` returned by `POST /auth/passkey/login/options` (single-use, expires 120 seconds after issue).
   * @example "sczkVEOwKMY0Kr947uYM5w"
   */
  sessionKey: string;
  /**
   * Client-chosen identifier of this app install/device (ADR-0049), max 128 characters. Self-reported and never verified — used only to group passkeys in the management UI, never for authorization. Recorded as the passkey's last-seen device on success.
   * @maxLength 128
   * @example "f3a1c9e2-7b4d-4e8a-9c21-5d6e7f8a9b0c"
   */
  deviceId?: string;
}

export interface PasskeyCredentialDto {
  /**
   * WebAuthn credential id (base64url, not a UUID). Use it as the path parameter of `DELETE /auth/passkey/credentials/{credentialId}`.
   * @example "xV3hQk2LrN8yTzP0aWcD6mFu9Jg"
   */
  credentialId: string;
  /**
   * Device label the client sent at registration; null when none was sent.
   * @example "iPhone 15 Pro"
   */
  deviceLabel: string | null;
  /**
   * Platform the client reported at registration; null when none was sent.
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID" | "WEB" | null;
  /**
   * `MULTI_DEVICE` = a synced passkey (e.g. iCloud Keychain, Google Password Manager); `SINGLE_DEVICE` = bound to one authenticator.
   * @example "MULTI_DEVICE"
   */
  deviceType: "SINGLE_DEVICE" | "MULTI_DEVICE";
  /**
   * When the passkey was registered.
   * @format date-time
   * @example "2026-09-30T08:15:00.000Z"
   */
  createdAt: string;
  /**
   * Last successful sign-in with this passkey; null if never used.
   * @format date-time
   * @example "2026-10-07T21:03:12.000Z"
   */
  lastUsedAt: string | null;
}

export interface PasskeyCredentialListDto {
  /** The caller's passkeys, newest first. */
  items: PasskeyCredentialDto[];
}

export interface DeviceEnrollmentChallengeDto {
  /**
   * Single-use id of this enrollment attempt; send it as `txId` to `POST /auth/device-credentials`.
   * @format uuid
   * @example "6b7c2f0e-1d4a-4c3b-9e8f-7a6b5c4d3e2f"
   */
  txId: string;
  /**
   * Server-issued challenge: unpadded base64url of 32 random bytes. The attested value is always the DECODED 32 bytes (ADR-0084). iOS: clientDataHash = SHA256(decodedNonce || SHA256(signingKeySpkiDer)) for DCAppAttestService.attestKey. Android: pass decodedNonce to setAttestationChallenge.
   * @example "oHMKl32MlcHKhs2I2GJIqQjSXIHu2zQB8EAm4GsF1M0"
   */
  nonce: string;
  /**
   * Seconds until this challenge expires.
   * @example 300
   */
  expiresIn: number;
}

/** Device credential enrollment. `IOS` requires `attestationObjectBase64` and `signingPublicKeyBase64`; `ANDROID` requires `certificateChainBase64`. The other platform's fields are ignored. */
export interface DeviceEnrollmentDto {
  /**
   * The `txId` from `POST /auth/device-credentials/challenge` (single-use).
   * @example "6b7c2f0e-1d4a-4c3b-9e8f-7a6b5c4d3e2f"
   */
  txId: string;
  /**
   * Device platform (uppercase); decides which attestation fields are required.
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID";
  /**
   * iOS only: base64-encoded CBOR attestation object from DCAppAttestService.attestKey, attesting a SEPARATE App Attest key whose clientDataHash commits to signingPublicKeyBase64 below (ADR-0079) — not the signing key itself. Required (non-empty) when `platform` is `IOS`.
   * @example "o2NmbXRvYXBwbGUtYXBwYXR0ZXN0Z2F0dFN0bXSiY3g1Y4JZAz..."
   */
  attestationObjectBase64?: string;
  /**
   * iOS only (ADR-0079): base64 (standard) SPKI DER public key of the PLAIN Secure Enclave signing key (SecKeyCreateRandomKey) this enrollment binds — the key actually used for every later sensitive-action signature. Its SHA-256 must equal the hash committed into attestationObjectBase64’s clientDataHash, or verification fails. Required when `platform` is `IOS`; at most 256 characters.
   * @maxLength 256
   * @example "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE8tqW3m1mE6hQx0oQ0bC3S8l3c2rJ5uH1zYw9o0kP7m6dTqvR2xYk8bN4aLw1eZpQf3sH6gU9iD2jK5vM7nXc0w=="
   */
  signingPublicKeyBase64?: string;
  /**
   * Android only: DER certificate chain from KeyStore.getCertificateChain, leaf first, each base64-encoded. Required (1–10 certificates) when `platform` is `ANDROID`.
   * @maxItems 10
   * @minItems 1
   * @example ["MIICtzCCAl2gAwIBAgIBATAKBggqhkjOPQQDAjA5...","MIIB8zCCAXmgAwIBAgIQ..."]
   */
  certificateChainBase64?: string[];
  /**
   * Device name shown in the device list (client-asserted), at most 128 characters.
   * @maxLength 128
   * @example "iPhone 15 Pro"
   */
  deviceLabel?: string;
  /**
   * OS version (client-asserted), at most 64 characters.
   * @maxLength 64
   * @example "18.6.1"
   */
  osVersion?: string;
  /**
   * App version (client-asserted), at most 64 characters.
   * @maxLength 64
   * @example "2.4.44"
   */
  appVersion?: string;
}

export interface DeviceEnrollmentResultDto {
  /**
   * Server-generated id of the new device credential. Store it on the device: it names the credential in `POST /auth/sensitive-action/prepare` and `DELETE /auth/device-credentials/{deviceId}`.
   * @format uuid
   * @example "3e9cd699-06e0-473e-9c41-c2ee8544d0ad"
   */
  deviceId: string;
  /**
   * Device platform (uppercase).
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID";
  /**
   * What the attestation proved: `HARDWARE` (key in Secure Enclave / TEE / StrongBox, chain trusted), `SOFTWARE` (Android chain trusted but the key is software-backed), `NONE` (not verified). Account deletion requires `HARDWARE`.
   * @example "HARDWARE"
   */
  attestationLevel: "NONE" | "SOFTWARE" | "HARDWARE";
  /**
   * Android only: the attestation proved the key cannot sign without a live biometric/device-credential check. Always `false` on iOS (App Attest cannot prove it). An Android credential with `false` cannot approve account deletion — re-enroll with user authentication required.
   * @example false
   */
  biometricBound: boolean;
}

export interface DeviceCredentialDto {
  /**
   * Id of the device credential.
   * @format uuid
   * @example "3e9cd699-06e0-473e-9c41-c2ee8544d0ad"
   */
  deviceId: string;
  /**
   * Device platform (uppercase).
   * @example "IOS"
   */
  platform: "IOS" | "ANDROID";
  /**
   * What the attestation proved: `HARDWARE` (key in Secure Enclave / TEE / StrongBox, chain trusted), `SOFTWARE` (Android chain trusted but the key is software-backed), `NONE` (not verified). Account deletion requires `HARDWARE`.
   * @example "HARDWARE"
   */
  attestationLevel: "NONE" | "SOFTWARE" | "HARDWARE";
  /**
   * Android only: the attestation proved the key cannot sign without a live biometric/device-credential check. Always `false` on iOS (App Attest cannot prove it). An Android credential with `false` cannot approve account deletion — re-enroll with user authentication required.
   * @example false
   */
  biometricBound: boolean;
  /**
   * Device name sent at enrollment; null when none was sent.
   * @example "iPhone 15 Pro"
   */
  deviceLabel: string | null;
  /**
   * OS version sent at enrollment; null when none was sent.
   * @example "18.6.1"
   */
  osVersion: string | null;
  /**
   * App version sent at enrollment; null when none was sent.
   * @example "2.4.44"
   */
  appVersion: string | null;
  /**
   * Last time this credential approved a sensitive action; null if never.
   * @format date-time
   * @example "2026-10-07T21:03:12.000Z"
   */
  lastUsedAt: string | null;
  /**
   * When the credential was enrolled.
   * @format date-time
   * @example "2026-09-30T08:15:00.000Z"
   */
  createdAt: string;
}

export interface DeviceCredentialListDto {
  /** Active device credentials, newest first. */
  items: DeviceCredentialDto[];
}

export interface SensitiveActionPrepareDto {
  /**
   * The sensitive action to approve. `account.delete` = `POST /core/users/me/deletion` or `DELETE /core/users/me`.
   * @example "account.delete"
   */
  action: "account.delete";
  /**
   * `deviceId` of this device's enrolled device credential (from `POST /auth/device-credentials`), whose key will sign.
   * @example "3e9cd699-06e0-473e-9c41-c2ee8544d0ad"
   */
  deviceId: string;
}

export interface SensitiveActionChallengeDto {
  /**
   * Single-use id of this approval attempt: the second line of the signed message, and `txId` of the confirm call.
   * @format uuid
   * @example "d221a282-57b7-4199-855e-082680bba721"
   */
  txId: string;
  /**
   * Seconds until this challenge expires.
   * @example 180
   */
  expiresIn: number;
  /**
   * Server-issued nonce, one ingredient of the canonical message (MBDA2\n<txId>\n<action>\n-\n<nonce>\n<aud>) the client must build and sign (ADR-0084). Unpadded base64url; used in the message as-is (not decoded).
   * @example "oHMKl32MlcHKhs2I2GJIqQjSXIHu2zQB8EAm4GsF1M0"
   */
  nonce: string;
  /**
   * App-identity string to use as the canonical message's <aud> field (matches what this device's attestation proved at enrollment): `<teamId>.<bundleId>` on iOS, the package name on Android.
   * @example "ABCDE12345.com.reflectalab.momentbook"
   */
  aud: string;
}

export interface SensitiveActionConfirmDto {
  /**
   * The `txId` from `POST /auth/sensitive-action/prepare`.
   * @example "d221a282-57b7-4199-855e-082680bba721"
   */
  txId: string;
  /**
   * base64url(DER-encoded ECDSA P-256 / SHA-256 signature) over the canonical message, made with the key of the credential named at prepare.
   * @example "MEUCIQDdP0x8hE6p3wZ9b4cS2nYQ1hW8l0K3v5bF6m7tJ0aXGQIgV9o2c4r5s6t7u8v9w0x1y2z3A4B5C6D7E8F9G0H1I2J"
   */
  signature: string;
}

export interface SensitiveActionGrantDto {
  /**
   * Single-use token to present as the X-Action-Grant header on the protected route. Valid until expiresAt or first use, whichever comes first; only for the approved action and this account.
   * @example "8Jb3mID8uPRCljwyDt4J9OIdpa3c18rr0B6dG7EyJQI"
   */
  grantToken: string;
  /**
   * When `grantToken` expires (ISO 8601, UTC).
   * @format date-time
   * @example "2026-10-08T00:05:00.000Z"
   */
  expiresAt: string;
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
