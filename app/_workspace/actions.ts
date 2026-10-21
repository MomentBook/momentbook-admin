"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/api/auth";
import { buildAdminLoginHref } from "@/lib/admin/paths";
import { clearAdminSession, getStoredAdminSession } from "@/lib/admin/session";

export async function logoutAdminAction(): Promise<never> {
  const cookieStore = await cookies();
  const session = await getStoredAdminSession(cookieStore);

  if (session?.refreshToken) {
    try {
      await logoutAdmin(session.refreshToken);
    } catch {
      // Clear the local admin session even if backend logout fails.
    }
  }

  await clearAdminSession(cookieStore);
  redirect(
    buildAdminLoginHref({
      loggedOut: true,
    }),
  );
}
