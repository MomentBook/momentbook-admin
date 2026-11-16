import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { buildAdminUserHref, buildAdminUsersHref } from "@/lib/navigation/paths";
import { loadUserDetailParams } from "@/lib/navigation/user-routes";
import { UserDetailView } from "@/features/users/components/user-detail-view";
import { resolveUserBanner } from "@/features/users/flash";
import { loadUserDetailPage } from "@/features/users/loader";

export const metadata: Metadata = {
  title: "User Detail",
};

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = decodeURIComponent((await params).userId);
  const returnTo = buildAdminUserHref(userId);
  const banner = resolveUserBanner(loadUserDetailParams(await searchParams));

  return renderWorkspacePage({
    active: "users",
    errorHeading: "The user details are temporarily unavailable.",
    returnTo,
    load: (accessToken) => loadUserDetailPage(accessToken, userId),
    render: (data, _counts, session) => {
      if (data === null) {
        redirect(buildAdminUsersHref({ error: "user_not_found" }));
      }

      return (
        <UserDetailView
          banner={banner}
          data={data.detail}
          subscriptions={data.subscriptions}
          returnTo={returnTo}
          sessionUserId={session.userId}
        />
      );
    },
  });
}
