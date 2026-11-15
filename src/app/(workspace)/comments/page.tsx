import type { Metadata } from "next";
import { isBackendApiError } from "@/lib/api/client";
import { loadAdminCommentsWorkspaceData } from "@/features/comments/loader";
import { parseCommentStatusTab, parsePublicIdFilter } from "@/entities/comment/model";
import { parseUuidFilter } from "@/entities/report/model";
import { buildAdminCommentsHref } from "@/lib/navigation/paths";
import {
  loadWorkspacePage,
  parsePage,
  readQueryParam,
} from "@/lib/workspace/load-workspace-page";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceError } from "@/components/layout/workspace-error";
import { resolveCommentBanner } from "@/features/comments/flash";
import { AdminCommentsListPageView } from "@/features/comments/components/comments-view";

export const metadata: Metadata = {
  title: "Comments",
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
        <WorkspaceError
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
