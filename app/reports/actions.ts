"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBackendApiError } from "@/lib/api/client";
import { updateAdminReport } from "@/lib/api/reports";
import { updateAdminUserStatus } from "@/lib/api/users";
import {
  ADMIN_REPORTS_PATH,
  buildAdminLoginHref,
  sanitizeAdminPath,
  withAdminQuery,
} from "@/lib/admin/paths";
import {
  clearAdminSession,
  requireAdminActionSession,
} from "@/lib/admin/session";
import type { ReportStatus } from "@/src/apis/types";

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseReportStatus(value: string): ReportStatus | undefined {
  if (
    value === "PENDING" ||
    value === "REVIEWED" ||
    value === "RESOLVED" ||
    value === "REJECTED"
  ) {
    return value;
  }
  return undefined;
}

export async function updateAdminReportAction(formData: FormData): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_REPORTS_PATH;
  const reportId = readText(formData.get("reportId"));
  const rawStatus = readText(formData.get("status"));
  const status = parseReportStatus(rawStatus);
  const adminNoteInput = formData.get("adminNote");
  const adminNote = typeof adminNoteInput === "string" ? adminNoteInput.trim() : undefined;

  const buildReturnEntries = (extra: Record<string, string | null | undefined>) => ({
    mutation: null,
    error: null,
    message: null,
    ...extra,
  });

  if (!reportId) {
    redirect(
      withAdminQuery(
        nextPath,
        buildReturnEntries({
          error: "missing_report_id",
        }),
      ),
    );
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);

  try {
    await updateAdminReport({
      accessToken: session.accessToken,
      reportId,
      report: {
        ...(status ? { status } : {}),
        adminNote: adminNote !== undefined ? adminNote : undefined,
      },
    });
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "session_expired",
          }),
        );
      }

      if (error.statusCode === 403) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "admin_access_denied",
          }),
        );
      }

      if (error.statusCode === 404) {
        redirect(
          withAdminQuery(
            nextPath,
            buildReturnEntries({
              error: "report_not_found",
            }),
          ),
        );
      }

      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({
            error: "report_update_failed",
            message: error.message,
          }),
        ),
      );
    }

    redirect(
      withAdminQuery(
        nextPath,
        buildReturnEntries({
          error: "report_update_failed",
        }),
      ),
    );
  }

  redirect(
    withAdminQuery(
      nextPath,
      buildReturnEntries({
        mutation: "report_updated",
        status: status ?? null,
      }),
    ),
  );
}

export async function updateAdminUserStatusAction(formData: FormData): Promise<never> {
  const cookieStore = await cookies();
  const nextPath =
    sanitizeAdminPath(readText(formData.get("returnTo"))) ?? ADMIN_REPORTS_PATH;
  const userId = readText(formData.get("userId"));
  const rawStatus = readText(formData.get("status"));
  const status = rawStatus === "banned" ? "banned" : "active";
  const reason = readText(formData.get("reason")) || undefined;
  // The report this decision answers (report detail only); the API records it
  // with the sanction and rejects one that is not about this user.
  const reportId = readText(formData.get("reportId"));

  const buildReturnEntries = (extra: Record<string, string | null | undefined>) => ({
    mutation: null,
    error: null,
    message: null,
    ...extra,
  });

  if (!userId) {
    redirect(
      withAdminQuery(
        nextPath,
        buildReturnEntries({
          error: "missing_user_id",
          message: "User ID is required.",
        }),
      ),
    );
  }

  const session = await requireAdminActionSession(cookieStore, nextPath);
  let resultStatus: string;

  try {
    const result = await updateAdminUserStatus({
      accessToken: session.accessToken,
      userId,
      data: {
        status,
        reason,
        ...(reportId ? { reportId } : {}),
      },
    });
    // Lifting a ban can leave the account inactive (pending consents); report
    // what the API did, not what was asked.
    resultStatus = result.status;
  } catch (error) {
    if (isBackendApiError(error)) {
      if (error.statusCode === 401) {
        await clearAdminSession(cookieStore);
        redirect(
          buildAdminLoginHref({
            next: nextPath,
            error: "session_expired",
          }),
        );
      }

      if (error.statusCode === 403) {
        redirect(
          withAdminQuery(
            nextPath,
            buildReturnEntries({
              error: "user_update_failed",
              message: error.message || "Cannot change the status of an admin account.",
            }),
          ),
        );
      }

      redirect(
        withAdminQuery(
          nextPath,
          buildReturnEntries({
            error: "user_update_failed",
            message: error.message,
          }),
        ),
      );
    }

    redirect(
      withAdminQuery(
        nextPath,
        buildReturnEntries({
          error: "user_update_failed",
        }),
      ),
    );
  }

  redirect(
    withAdminQuery(
      nextPath,
      buildReturnEntries({
        mutation: "user_status_updated",
        userStatus: resultStatus,
      }),
    ),
  );
}
