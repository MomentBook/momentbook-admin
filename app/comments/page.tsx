import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminCommentsWorkspaceData } from "@/lib/admin/comments";
import { parseCommentStatusTab, parsePublicIdFilter } from "@/lib/admin/comments-shared";
import { parseUuidFilter } from "@/lib/admin/reports-shared";
import { buildAdminCommentsHref } from "@/lib/admin/paths";
import {
  loadWorkspacePage,
  parsePage,
  readQueryParam,
} from "@/app/_workspace/workspace-data";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AdminWorkspaceErrorPage } from "@/app/_workspace/AdminWorkspaceErrorPage";
import { resolveCommentBanner } from "./comment-banner";
import { AdminCommentsListPageView } from "./AdminCommentsListPageView";

export const metadata: Metadata = {
  title: "Comments",
  robots: buildNoIndexRobots(),
};

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const read = (key: string) => readQueryParam(resolvedSearchParams[key]);
  const tab = parseCommentStatusTab(read("status"));
  const userId = parseUuidFilter(read("userId"));
  const publicId = parsePublicIdFilter(read("publicId"));
  const pageNumber = parsePage(read("page"));
  const banner = resolveCommentBanner({
    mutation: read("mutation"),
    error: read("error"),
    message: read("message"),
  });
  const returnTo = buildAdminCommentsHref({
    status: tab === "active" ? null : tab,
    userId,
    publicId,
    page: pageNumber,
  });

  let page;

  try {
    page = await loadWorkspacePage({
      returnTo,
      load: (accessToken) =>
        loadAdminCommentsWorkspaceData(accessToken, { tab, userId, publicId, page: pageNumber }),
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      return (
        <AdminWorkspaceErrorPage
          heading="Comments are temporarily unavailable."
          message={error.message}
          statusCode={error.statusCode}
        />
      );
    }

    throw error;
  }

  return (
    <WorkspaceShell active="comments" counts={page.counts} session={page.session}>
      <AdminCommentsListPageView
        banner={banner}
        data={page.data}
        filters={{ tab, userId, publicId }}
        returnTo={returnTo}
      />
    </WorkspaceShell>
  );
}
