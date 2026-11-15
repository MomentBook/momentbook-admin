"use server";

import { z } from "zod";
import { updateAdminReport } from "@/lib/api/reports";
import { REPORT_STATUSES } from "@/lib/api/types";
import { formText, requiredText, runAdminAction } from "@/lib/actions/admin-action";
import { ADMIN_REPORTS_PATH } from "@/lib/navigation/paths";

const reportFields = z.object({
  reportId: requiredText("missing_report_id"),
  // An unknown status leaves the status as it is.
  status: formText.transform((value) => REPORT_STATUSES.find((status) => status === value)),
  // Blank clears the note; a form without the field leaves it as it is.
  adminNote: z.string().optional().transform((value) => value?.trim()),
});

/** Sets a report's status and the admin's note. */
export async function updateAdminReportAction(formData: FormData): Promise<never> {
  return runAdminAction({
    formData,
    fallbackPath: ADMIN_REPORTS_PATH,
    fields: reportFields,
    failure: "report_update_failed",
    onApiError: (error) =>
      error.statusCode === 404 ? { query: { error: "report_not_found" } } : undefined,
    run: async (input, session) => {
      await updateAdminReport({
        accessToken: session.accessToken,
        reportId: input.reportId,
        report: {
          ...(input.status ? { status: input.status } : {}),
          adminNote: input.adminNote,
        },
      });

      return { query: { mutation: "report_updated", status: input.status ?? null } };
    },
  });
}
