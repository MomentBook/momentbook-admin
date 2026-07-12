import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminAccessDeniedError,
  AdminSessionExpiredError,
} from "@/lib/admin/api";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  getAdminReviewStatusLabel,
  loadAdminReviewWorkspaceData,
  type AdminOverviewData,
  type AdminReviewQueueData,
  type AdminReviewQueueStatus,
  type AdminReviewStatus,
  parseAdminReviewStatus,
} from "@/lib/admin/reviews";
import { buildAdminSessionInvalidateHref } from "@/lib/admin/paths";
import {
  type AdminSession,
  requireAdminApiSession,
} from "@/lib/admin/session";
import type { Language } from "@/lib/i18n/config";

export type AdminDashboardBanner = {
  tone: "default" | "error" | "success";
  message: string;
};

export function readQueryParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function parseStatus(value: string | null): AdminReviewQueueStatus {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }

  return "pending";
}

export function parseReviewStatus(value: string | null): AdminReviewStatus | null {
  return parseAdminReviewStatus(value);
}

export function resolveBanner(options: {
  error: string | null;
  mutation: string | null;
  reviewStatus: AdminReviewStatus | null;
  targetPublicId: string | null;
}): AdminDashboardBanner | null {
  if (
    options.mutation === "review_updated" &&
    options.targetPublicId &&
    options.reviewStatus
  ) {

    return {
      tone: "success",
      message: `${options.targetPublicId} updated to ${getAdminReviewStatusLabel(options.reviewStatus)}.`,
    };
  }

  switch (options.error) {
    case "missing_public_id":
      return {
        tone: "error",
        message: "Enter a public ID.",
      };
    case "invalid_review_status":
      return {
        tone: "error",
        message: "Choose a review status.",
      };
    case "admin_access_denied":
      return {
        tone: "error",
        message: "This session cannot update review status.",
      };
    case "review_target_not_found":
      return {
        tone: "error",
        message: "No published journey matched that public ID.",
      };
    case "review_update_failed":
      return {
        tone: "error",
        message: "Could not update review status. Try again.",
      };
    default:
      return null;
  }
}

export async function withAdminWorkspaceSession<T>(options: {
  returnTo: string;
  load: (accessToken: string) => Promise<T>;
}): Promise<{
  data: T;
  session: AdminSession;
}> {
  const cookieStore = await cookies();
  const session = await requireAdminApiSession(cookieStore, options.returnTo);

  try {
    const data = await options.load(session.accessToken);

    return {
      data,
      session,
    };
  } catch (error) {
    if (error instanceof AdminSessionExpiredError) {
      redirect(
        buildAdminSessionInvalidateHref({
          next: options.returnTo,
          error: "session_expired",
        }),
      );
    }

    if (error instanceof AdminAccessDeniedError) {
      redirect(
        buildAdminSessionInvalidateHref({
          next: options.returnTo,
          error: "admin_access_denied",
        }),
      );
    }

    throw error;
  }
}

export async function loadAdminWorkspaceShell(options: {
  page: number;
  returnTo: string;
  status: AdminReviewQueueStatus;
}): Promise<{
  overview: AdminOverviewData;
  queue: AdminReviewQueueData;
  session: AdminSession;
}> {
  const { data, session } = await withAdminWorkspaceSession({
    returnTo: options.returnTo,
    load: (accessToken) => loadAdminReviewWorkspaceData({
      accessToken,
      page: options.page,
      status: options.status,
      limit: ADMIN_REVIEW_PAGE_SIZE,
    }),
  });

  return {
    overview: data.overview,
    queue: data.queue,
    session,
  };
}

export async function loadAdminReviewDetailShell(options: {
  page: number;
  publicId: string;
  returnTo: string;
  status: AdminReviewQueueStatus;
  lang?: Language | null;
}) {
  const { data, session } = await withAdminWorkspaceSession({
    returnTo: options.returnTo,
    load: (accessToken) => loadAdminReviewWorkspaceData({
      accessToken,
      page: options.page,
      status: options.status,
      limit: ADMIN_REVIEW_PAGE_SIZE,
      publicId: options.publicId,
      lang: options.lang,
    }),
  });

  return {
    detail: data.detail,
    queue: data.queue,
    session,
  };
}
