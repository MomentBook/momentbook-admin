import type { Metadata } from "next";
import { renderWorkspacePage } from "@/components/layout/workspace-page";
import { loadCommentsParams } from "@/lib/navigation/comment-routes";
import { buildAdminCommentsHref } from "@/lib/navigation/paths";
import { parseCommentStatusTab, parsePublicIdFilter } from "@/entities/comment/model";
import { CommentsView } from "@/features/comments/components/comments-view";
import { resolveCommentBanner } from "@/features/comments/flash";
import { loadAdminCommentsWorkspaceData } from "@/features/comments/loader";

export const metadata: Metadata = {
  title: "Comments",
};

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadCommentsParams(await searchParams);
  const tab = parseCommentStatusTab(query.status);
  const userId = query.userId ?? undefined;
  const publicId = parsePublicIdFilter(query.publicId);
  const returnTo = buildAdminCommentsHref({
    status: tab === "active" ? null : tab,
    userId,
    publicId,
    page: query.page,
  });

  return renderWorkspacePage({
    active: "comments",
    errorHeading: "Comments are temporarily unavailable.",
    returnTo,
    load: (accessToken) =>
      loadAdminCommentsWorkspaceData(accessToken, { tab, userId, publicId, page: query.page }),
    render: (data) => (
      <CommentsView
        banner={resolveCommentBanner(query)}
        data={data}
        filters={{ tab, userId, publicId }}
        returnTo={returnTo}
      />
    ),
  });
}
