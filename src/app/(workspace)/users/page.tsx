import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { buildAdminUsersHref } from "@/lib/navigation/paths";
import { loadUsersParams } from "@/lib/navigation/user-routes";
import {
  parseUserRoleFilter,
  parseUserStatusFilter,
  resolveUserSearch,
} from "@/entities/user/model";
import { UsersListView } from "@/features/users/components/users-list-view";
import { resolveUserBanner } from "@/features/users/flash";
import { loadAdminUsersWorkspaceData } from "@/features/users/loader";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadUsersParams(await searchParams);
  const { q, ignored: searchIgnored } = resolveUserSearch(query.q);
  const status = parseUserStatusFilter(query.status);
  const role = parseUserRoleFilter(query.role);
  const returnTo = buildAdminUsersHref({
    q,
    status: status ? query.status : null,
    role: role ? query.role : null,
    page: query.page,
  });

  return renderWorkspacePage({
    active: "users",
    errorHeading: "The user directory is temporarily unavailable.",
    returnTo,
    load: (accessToken) =>
      loadAdminUsersWorkspaceData(accessToken, { q, status, role, page: query.page }),
    render: (data) => (
      <UsersListView
        // The directory's only banner: an action's account was gone.
        banner={resolveUserBanner({ error: query.error === "user_not_found" ? query.error : null })}
        data={data}
        filters={{ q, status, role }}
        searchIgnored={searchIgnored}
      />
    ),
  });
}
