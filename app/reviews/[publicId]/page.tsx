import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminReviewDetailPageView } from "./AdminReviewDetailPageView";
import {
  buildAdminReviewDetailHref,
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";
import { resolveSupportedLanguage, toLocaleTag } from "@/lib/i18n/config";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  loadAdminReviewDetailShell,
  parsePage,
  parseReviewStatus,
  parseStatus,
  readQueryParam,
  resolveBanner,
} from "@/app/_workspace/workspace-data";

export const metadata: Metadata = {
  title: "Review Detail",
  robots: buildNoIndexRobots(),
};

export default async function AdminReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const publicId = decodeURIComponent(resolvedParams.publicId);
  const page = parsePage(readQueryParam(resolvedSearchParams.page));
  const status = parseStatus(readQueryParam(resolvedSearchParams.status));
  const detailLanguage = resolveSupportedLanguage(
    readQueryParam(resolvedSearchParams.lang),
  );
  const detailLocale = detailLanguage ? toLocaleTag(detailLanguage) : null;
  const targetPublicId = readQueryParam(resolvedSearchParams.targetPublicId);
  const mutation = readQueryParam(resolvedSearchParams.mutation);
  const reviewStatus = parseReviewStatus(
    readQueryParam(resolvedSearchParams.reviewStatus),
  );
  const returnTo = buildAdminReviewDetailHref(publicId, {
    lang: detailLocale,
    page: page > 1 ? String(page) : null,
    status: status === "pending" ? null : status,
  });

  const banner = resolveBanner({
    error: readQueryParam(resolvedSearchParams.error),
    mutation,
    revalidation: readQueryParam(resolvedSearchParams.revalidation),
    reviewStatus,
    targetPublicId,
  });

  const reviewMutation =
    mutation === "review_updated" && targetPublicId && reviewStatus
      ? {
          publicId: targetPublicId,
          reviewStatus,
        }
      : null;

  const { detail, queue, session } = await loadAdminReviewDetailShell({
    page,
    publicId,
    returnTo,
    status,
    lang: detailLanguage,
  });

  if (!detail) {
    redirect(
      buildAdminWorkspaceHref("reviews", {
        error: "review_target_not_found",
        page: page > 1 ? String(page) : null,
        status: status === "pending" ? null : status,
      }),
    );
  }

  return (
    <AdminReviewDetailPageView
      banner={banner}
      detail={detail}
      queue={queue}
      reviewMutation={reviewMutation}
      returnTo={returnTo}
      session={session}
      targetPublicId={targetPublicId}
    />
  );
}
