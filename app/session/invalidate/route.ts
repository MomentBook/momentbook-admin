import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_ROOT_PATH,
  buildAdminLoginHref,
  sanitizeAdminPath,
  sanitizeAdminSessionRedirectError,
} from "@/lib/admin/paths";
import { clearAdminSession } from "@/lib/admin/session";
import { resolveSiteUrl } from "@/lib/site-url";

function buildRedirectResponse(path: string) {
  return NextResponse.redirect(new URL(path, resolveSiteUrl()));
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const requestUrl = new URL(request.url);
  const nextPath =
    sanitizeAdminPath(requestUrl.searchParams.get("next")) ?? ADMIN_ROOT_PATH;
  const error = sanitizeAdminSessionRedirectError(
    requestUrl.searchParams.get("error"),
  );

  await clearAdminSession(cookieStore);

  return buildRedirectResponse(
    buildAdminLoginHref({
      next: nextPath,
      error: error ?? "session_expired",
    }),
  );
}
