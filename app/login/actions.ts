"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  readAccessTokenClaims,
  readTokenExpiryMs,
} from "@/lib/admin/api";
import { ADMIN_ALLOWED_EMAIL, isAllowedAdminEmail } from "@/lib/admin/config";
import {
  ADMIN_ROOT_PATH,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { createAdminSession } from "@/lib/admin/session";
import { ENV } from "@/src/configs/env.server";

export type LoginState = {
  error: string | null;
};

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

type BackendLoginPayload = {
  status?: string;
  data?: {
    user?: {
      _id?: string;
      userId?: string;
      name?: string | null;
      email?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
  };
};

function buildLoginEndpoint() {
  return new URL("/v2/auth/email/login", ENV.API_BASE_URL).toString();
}

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const next = readText(formData.get("next"));
  const nextPath =
    sanitizeAdminPath(next || null) ?? ADMIN_ROOT_PATH;
  const password = readText(formData.get("password"));

  if (!password) {
    return { error: "Enter password." };
  }

  const allowedEmail = ADMIN_ALLOWED_EMAIL;

  if (!allowedEmail) {
    return { error: "Server misconfigured." };
  }

  let loginResponse: Response;

  try {
    loginResponse = await fetch(buildLoginEndpoint(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: allowedEmail,
        password,
      }),
    });
  } catch {
    return { error: "Could not reach the API server." };
  }

  const loginPayload = (await loginResponse.json().catch(() => null)) as
    | BackendLoginPayload
    | null;

  if (!loginResponse.ok) {
    if (loginResponse.status === 401) {
      return { error: "Invalid password." };
    }

    if (loginResponse.status === 403) {
      return { error: "This account cannot access admin." };
    }

    return { error: "Service unavailable." };
  }

  if (
    loginPayload?.status !== "success" ||
    (!loginPayload?.data?.user?._id &&
      !loginPayload?.data?.user?.userId) ||
    !loginPayload?.data?.accessToken ||
    !loginPayload?.data?.refreshToken
  ) {
    return { error: "Incomplete login response." };
  }

  const { user, accessToken, refreshToken } = loginPayload.data;

  let claims;

  try {
    claims = readAccessTokenClaims(accessToken);
  } catch {
    return { error: "Invalid token response." };
  }

  const email =
    typeof claims.email === "string"
      ? claims.email
      : typeof user.email === "string"
        ? user.email
        : null;

  if (!isAllowedAdminEmail(email)) {
    return { error: `Only ${allowedEmail} can sign in.` };
  }

  if (claims.role !== "admin") {
    return { error: "This account does not have admin access." };
  }

  const userId = (user._id || user.userId) as string;
  const cookieStore = await cookies();

  try {
    await createAdminSession(cookieStore, {
      userId,
      role: "admin",
      email,
      name:
        typeof claims.name === "string"
          ? claims.name
          : typeof user.name === "string"
            ? user.name
            : null,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: readTokenExpiryMs(accessToken),
      refreshTokenExpiresAt: readTokenExpiryMs(refreshToken),
    });
  } catch {
    return { error: "Could not create session." };
  }

  redirect(nextPath);
}
