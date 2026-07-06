import "server-only";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { EncryptJWT, jwtDecrypt } from "jose";
import {
  readAccessTokenClaims,
  readTokenExpiryMs,
  refreshAdminTokens,
} from "@/lib/admin/api";
import { isAllowedAdminEmail } from "@/lib/admin/config";
import {
  buildAdminLoginHref,
  buildAdminSessionRefreshHref,
} from "@/lib/admin/paths";
import { ENV } from "@/src/configs/env.server";

const ADMIN_SESSION_COOKIE_NAME = "momentbook_admin_session";
const ADMIN_SESSION_COOKIE_PATH = "/";
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

function isSessionCookieSecure(): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_ADMIN_SITE_URL;

  if (siteUrl) {
    try {
      return new URL(siteUrl).protocol === "https:";
    } catch {
      // fall through
    }
  }

  return process.env.NODE_ENV === "production";
}

export type AdminSession = {
  userId: string;
  role: "admin";
  email: string | null;
  name: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export type AdminCookieStore = Awaited<
  ReturnType<typeof import("next/headers").cookies>
>;

function getSessionSecret(): Uint8Array {
  const raw = ENV.ADMIN_SESSION_SECRET?.trim();

  if (!raw) {
    throw new Error("Missing required server env: ADMIN_SESSION_SECRET");
  }

  return createHash("sha256").update(raw).digest();
}

function isSessionShape(value: unknown): value is AdminSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.userId === "string" &&
    payload.role === "admin" &&
    (typeof payload.email === "string" || payload.email === null) &&
    (typeof payload.name === "string" || payload.name === null) &&
    typeof payload.accessToken === "string" &&
    typeof payload.refreshToken === "string" &&
    typeof payload.accessTokenExpiresAt === "number" &&
    typeof payload.refreshTokenExpiresAt === "number"
  );
}

async function encryptAdminSession(session: AdminSession): Promise<string> {
  return new EncryptJWT(session)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(session.refreshTokenExpiresAt / 1000))
    .encrypt(getSessionSecret());
}

export async function createAdminSession(
  cookieStore: AdminCookieStore,
  session: AdminSession,
): Promise<void> {
  const expires = new Date(session.refreshTokenExpiresAt);
  const encrypted = await encryptAdminSession(session);

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: isSessionCookieSecure(),
    sameSite: "lax",
    expires,
    path: ADMIN_SESSION_COOKIE_PATH,
  });
}

async function readStoredAdminSessionCookie(
  cookieStore: AdminCookieStore,
): Promise<AdminSession | null> {
  const encrypted = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!encrypted) {
    return null;
  }

  try {
    const { payload } = await jwtDecrypt(encrypted, getSessionSecret());
    return isSessionShape(payload) ? payload : null;
  } catch {
    return null;
  }
}

export async function getStoredAdminSession(
  cookieStore: AdminCookieStore,
): Promise<AdminSession | null> {
  const session = await readStoredAdminSessionCookie(cookieStore);

  if (!session) {
    return null;
  }

  if (session.refreshTokenExpiresAt <= Date.now()) {
    return null;
  }

  if (!isAllowedAdminEmail(session.email)) {
    return null;
  }

  return session;
}

export async function getAdminSession(
  cookieStore: AdminCookieStore,
): Promise<AdminSession | null> {
  const session = await getStoredAdminSession(cookieStore);

  if (!session) {
    return null;
  }

  return session;
}

function requiresAdminSessionRefresh(session: AdminSession): boolean {
  return (
    session.accessTokenExpiresAt - Date.now() <= ACCESS_TOKEN_REFRESH_WINDOW_MS
  );
}

async function buildRefreshedAdminSession(
  session: AdminSession,
): Promise<AdminSession | null> {
  try {
    const refreshed = await refreshAdminTokens(session.refreshToken);
    const claims = readAccessTokenClaims(refreshed.accessToken);
    if (claims.role !== "admin") {
      return null;
    }

    const nextSession: AdminSession = {
      userId: session.userId,
      role: "admin",
      email:
        typeof claims.email === "string" ? claims.email : session.email,
      name: typeof claims.name === "string" ? claims.name : session.name,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessTokenExpiresAt: readTokenExpiryMs(refreshed.accessToken),
      refreshTokenExpiresAt: readTokenExpiryMs(refreshed.refreshToken),
    };

    if (!isAllowedAdminEmail(nextSession.email)) {
      return null;
    }

    return nextSession;
  } catch {
    return null;
  }
}

export async function refreshAdminSession(
  cookieStore: AdminCookieStore,
  session: AdminSession,
): Promise<AdminSession | null> {
  if (!requiresAdminSessionRefresh(session)) {
    return session;
  }

  const nextSession = await buildRefreshedAdminSession(session);

  if (!nextSession) {
    await clearAdminSession(cookieStore);
    return null;
  }

  await createAdminSession(cookieStore, nextSession);
  return nextSession;
}

export async function clearAdminSession(
  cookieStore: AdminCookieStore,
): Promise<void> {
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSessionCookieSecure(),
    sameSite: "lax",
    expires: new Date(0),
    path: ADMIN_SESSION_COOKIE_PATH,
  });
}

export async function requireAdminSession(
  cookieStore: AdminCookieStore,
  nextPath: string,
): Promise<AdminSession> {
  const session = await getAdminSession(cookieStore);

  if (!session) {
    redirect(
      buildAdminLoginHref({
        next: nextPath,
        error: "session_expired",
      }),
    );
  }

  return session;
}

export async function requireAdminApiSession(
  cookieStore: AdminCookieStore,
  nextPath: string,
): Promise<AdminSession> {
  const session = await getStoredAdminSession(cookieStore);

  if (!session) {
    redirect(
      buildAdminLoginHref({
        next: nextPath,
        error: "session_expired",
      }),
    );
  }

  if (requiresAdminSessionRefresh(session)) {
    redirect(
      buildAdminSessionRefreshHref({
        next: nextPath,
      }),
    );
  }

  return session;
}

export async function requireAdminActionSession(
  cookieStore: AdminCookieStore,
  nextPath: string,
): Promise<AdminSession> {
  const session = await getStoredAdminSession(cookieStore);

  if (!session) {
    redirect(
      buildAdminLoginHref({
        next: nextPath,
        error: "session_expired",
      }),
    );
  }

  const refreshedSession = await refreshAdminSession(cookieStore, session);

  if (!refreshedSession) {
    redirect(
      buildAdminLoginHref({
        next: nextPath,
        error: "session_expired",
      }),
    );
  }

  return refreshedSession;
}
