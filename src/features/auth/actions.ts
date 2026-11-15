"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildAdminSession } from "@/lib/auth/session-schema";
import { hasAdminRole, readTokenClaims } from "@/lib/auth/token";
import {
  ADMIN_ROOT_PATH,
  sanitizeAdminPath,
} from "@/lib/navigation/paths";
import { createAdminSession } from "@/lib/auth/session";
import type { AuthSessionDto } from "@/lib/api/types";
import { ENV } from "@/lib/env";

export type LoginState = {
  error: string | null;
};

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** The v3 sign-in body is the bare `AuthSessionDto`; it is read defensively
 * because it comes over the network. */
type BackendLoginPayload = Partial<
  Pick<AuthSessionDto, "accessToken" | "refreshToken">
> & {
  user?: Partial<Pick<AuthSessionDto["user"], "id" | "name" | "email">>;
};

function buildLoginEndpoint() {
  return new URL("/auth/email/login", ENV.API_BASE_URL).toString();
}

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const next = readText(formData.get("next"));
  const nextPath =
    sanitizeAdminPath(next || null) ?? ADMIN_ROOT_PATH;
  const email = readText(formData.get("email"));
  const password = readText(formData.get("password"));

  if (!email) {
    return { error: "Enter email." };
  }

  if (!password) {
    return { error: "Enter password." };
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
        email,
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

  const user = loginPayload?.user;
  const accessToken = loginPayload?.accessToken;
  const refreshToken = loginPayload?.refreshToken;

  if (!user?.id || !accessToken || !refreshToken) {
    return { error: "Incomplete login response." };
  }

  const claims = readTokenClaims(accessToken);

  if (!claims) {
    return { error: "Invalid token response." };
  }

  if (!hasAdminRole(claims)) {
    return { error: "This account does not have admin access." };
  }

  const cookieStore = await cookies();

  try {
    await createAdminSession(
      cookieStore,
      buildAdminSession(
        { accessToken, refreshToken },
        {
          userId: user.id,
          email: typeof user.email === "string" ? user.email : null,
          name: typeof user.name === "string" ? user.name : null,
        },
      ),
    );
  } catch {
    return { error: "Could not create session." };
  }

  redirect(nextPath);
}
