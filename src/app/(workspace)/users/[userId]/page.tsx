import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminUserSubscriptionsOrNull } from "@/features/users/subscriptions-loader";
import { loadAdminUserDetailWorkspaceData } from "@/features/users/loader";
import { buildAdminUserHref, buildAdminUsersHref } from "@/lib/navigation/paths";
import { loadWorkspacePage, readQueryParam } from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { resolveUserBanner } from "@/features/users/flash";
import { AdminUserDetailPageView } from "@/features/users/components/user-detail-view";

export const metadata: Metadata = {
  title: "User Detail",
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
      load: async (accessToken) => {
        const [detail, subscriptions] = await Promise.all([
          loadAdminUserDetailWorkspaceData(accessToken, userId),
          loadAdminUserSubscriptionsOrNull(accessToken, userId),
        ]);

        return { detail, subscriptions };
      },
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      // The API answers 404 for an unknown id and for one that is not a UUID.
      if (error.statusCode === 404) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      return (
        <WorkspaceError
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
        data={result.data.detail}
        subscriptions={result.data.subscriptions}
        returnTo={returnTo}
        sessionUserId={result.session.userId}
      />
    </WorkspaceShell>
  );
}
