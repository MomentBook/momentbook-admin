import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  readAccessTokenClaims,
  readTokenExpiryMs,
} from "@/lib/admin/api";
import { ADMIN_ALLOWED_EMAIL, isAllowedAdminEmail, normalizeAdminEmail } from "@/lib/admin/config";
import { createAdminSession } from "@/lib/admin/session";

type SessionBootstrapRequest = {
  user?: {
    _id?: unknown;
    userId?: unknown;
    name?: unknown;
    email?: unknown;
  };
  accessToken?: unknown;
  refreshToken?: unknown;
};

function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildErrorResponse(
  status: number,
  error: string,
  message: string,
) {
  return NextResponse.json(
    {
      status: "error",
      error,
      message,
    },
    { status },
  );
}

function resolveSessionEmail(input: {
  claimEmail: string | null | undefined;
  loginEmail: string | null | undefined;
}) {
  const claimEmail = normalizeAdminEmail(input.claimEmail);
  const loginEmail = normalizeAdminEmail(input.loginEmail);

  if (claimEmail && loginEmail && claimEmail !== loginEmail) {
    return null;
  }

  return claimEmail ?? loginEmail;
}

function readSessionUserId(
  user: SessionBootstrapRequest["user"],
): string | null {
  return readText(user?._id) ?? readText(user?.userId);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const payload = (await request.json().catch(() => null)) as
    | SessionBootstrapRequest
    | null;

  if (!payload || typeof payload !== "object") {
    return buildErrorResponse(
      400,
      "invalid_request",
      "The admin session payload is missing or malformed.",
    );
  }

  const userId = readSessionUserId(payload.user);
  const accessToken = readText(payload.accessToken);
  const refreshToken = readText(payload.refreshToken);

  if (!userId || !accessToken || !refreshToken) {
    return buildErrorResponse(
      400,
      "invalid_request",
      "The admin session payload is incomplete.",
    );
  }

  let claims;

  try {
    claims = readAccessTokenClaims(accessToken);
  } catch {
    return buildErrorResponse(
      400,
      "invalid_tokens",
      "The returned admin token could not be validated.",
    );
  }

  if (claims.role !== "admin") {
    return buildErrorResponse(
      403,
      "admin_only",
      "This account does not have admin review access.",
    );
  }

  const email = resolveSessionEmail({
    claimEmail: typeof claims.email === "string" ? claims.email : null,
    loginEmail: readText(payload.user?.email),
  });

  if (!isAllowedAdminEmail(email)) {
    return buildErrorResponse(
      403,
      "account_not_allowed",
      `Only ${ADMIN_ALLOWED_EMAIL} can access the admin workspace.`,
    );
  }

  try {
    await createAdminSession(cookieStore, {
      userId,
      role: "admin",
      email,
      name:
        typeof claims.name === "string"
          ? claims.name
          : readText(payload.user?.name),
      accessToken,
      refreshToken,
      accessTokenExpiresAt: readTokenExpiryMs(accessToken),
      refreshTokenExpiresAt: readTokenExpiryMs(refreshToken),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("ADMIN_SESSION_SECRET")
    ) {
      return buildErrorResponse(
        500,
        "server_misconfigured",
        "The admin session secret is not configured on this web server.",
      );
    }

    return buildErrorResponse(
      500,
      "session_create_failed",
      "The admin session could not be created.",
    );
  }

  return NextResponse.json({
    status: "success",
    data: {
      email,
    },
  });
}
