import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminUserDetailWorkspaceData } from "@/lib/admin/users";
import { buildAdminUserHref, buildAdminUsersHref } from "@/lib/admin/paths";
import { loadWorkspacePage, readQueryParam } from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveUserBanner } from "../user-banner";
import { AdminUserDetailPageView } from "./AdminUserDetailPageView";

export const metadata: Metadata = {
  title: "User Detail",
  robots: buildNoIndexRobots(),
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const userId = decodeURIComponent(resolvedParams.userId);
  const returnTo = buildAdminUserHref(userId);
  const read = (key: string) => readQueryParam(resolvedSearchParams[key]);
  const banner = resolveUserBanner({
    mutation: read("mutation"),
    error: read("error"),
    message: read("message"),
    revokedSessions: read("revokedSessions"),
    userStatus: read("userStatus"),
  });

  let result;

  try {
    result = await loadWorkspacePage({
      returnTo,
      load: (accessToken) => loadAdminUserDetailWorkspaceData(accessToken, userId),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      // The API answers 404 for an unknown id and for one that is not a UUID.
      if (error.statusCode === 404) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      return (
        <AdminWorkspaceErrorPage
          heading="The user details are temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="users" counts={result.counts} session={result.session}>
      <AdminUserDetailPageView
        banner={banner}
        data={result.data}
        returnTo={returnTo}
        sessionUserId={result.session.userId}
      />
    </WorkspaceShell>
  );
}
