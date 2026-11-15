"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readFormText } from "@/lib/actions/admin-action";
import { loginWithEmail } from "@/lib/api/auth";
import { isBackendApiError } from "@/lib/api/client";
import type { AuthSessionDto } from "@/lib/api/types";
import { createAdminSession } from "@/lib/auth/session";
import { buildAdminSession } from "@/lib/auth/session-schema";
import { hasAdminRole, readTokenClaims } from "@/lib/auth/token";
import { ADMIN_ROOT_PATH, sanitizeAdminPath } from "@/lib/navigation/paths";
import { loginFields } from "./schema";

export type LoginState = {
  error: string | null;
};

/** The v3 sign-in body is the bare `AuthSessionDto`; it is read defensively
 * because it comes over the network. */
type LoginPayload =
  | (Partial<Pick<AuthSessionDto, "accessToken" | "refreshToken">> & {
      user?: Partial<Pick<AuthSessionDto["user"], "id" | "name" | "email">>;
    })
  | null
  | undefined;

/** What the form says when the API refuses or cannot be reached. */
function refusal(error: unknown): string {
  if (!isBackendApiError(error)) {
    return "Could not reach the API server.";
  }

  if (error.statusCode === 401) {
    return "Invalid password.";
  }

  if (error.statusCode === 403) {
    return "This account cannot access admin.";
  }

  return "Service unavailable.";
}

/** Signs in with email and password (`useActionState`): a refusal comes back
 * as the form's error, a success stores the admin session and goes to
 * `next`. */
export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const nextPath = sanitizeAdminPath(readFormText(formData, "next") || null) ?? ADMIN_ROOT_PATH;
  const fields = loginFields.safeParse({
    email: readFormText(formData, "email"),
    password: readFormText(formData, "password"),
  });

  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Enter email and password." };
  }

  let payload: LoginPayload;

  try {
    payload = await loginWithEmail(fields.data);
  } catch (error) {
    return { error: refusal(error) };
  }

  const user = payload?.user;
  const accessToken = payload?.accessToken;
  const refreshToken = payload?.refreshToken;

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

  try {
    await createAdminSession(
      await cookies(),
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
