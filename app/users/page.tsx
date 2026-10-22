import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminUsersWorkspaceData } from "@/lib/admin/users";
import {
  parseUserRoleFilter,
  parseUserStatusFilter,
  resolveUserSearch,
} from "@/lib/admin/users-shared";
import { buildAdminUsersHref } from "@/lib/admin/paths";
import {
  loadWorkspacePage,
  parsePage,
  readQueryParam,
} from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { AdminUsersListPageView } from "./AdminUsersListPageView";

export const metadata: Metadata = {
  title: "Users",
  robots: buildNoIndexRobots(),
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const { q, ignored: searchIgnored } = resolveUserSearch(
    readQueryParam(resolvedSearchParams.q),
  );
  const statusParam = readQueryParam(resolvedSearchParams.status);
  const status = parseUserStatusFilter(statusParam);
  const roleParam = readQueryParam(resolvedSearchParams.role);
  const role = parseUserRoleFilter(roleParam);
  const pageNumber = parsePage(readQueryParam(resolvedSearchParams.page));
  const notFound = readQueryParam(resolvedSearchParams.error) === "user_not_found";
  const returnTo = buildAdminUsersHref({
    q,
    status: status ? statusParam : null,
    role: role ? roleParam : null,
    page: pageNumber,
  });

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminUsersWorkspaceData(accessToken, { q, status, role, page: pageNumber }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="The user directory is temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="users" counts={page.counts} session={page.session}>
      <AdminUsersListPageView
        data={page.data}
        filters={{ q, status, role }}
        searchIgnored={searchIgnored}
        notFound={notFound}
      />
    </WorkspaceShell>
  );
}
