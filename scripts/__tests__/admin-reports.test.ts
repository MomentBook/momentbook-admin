import { describe, expect, it } from "vitest";
import {
  buildAdminReportDetailHref,
  buildAdminReportsHref,
  parseAdminWorkspaceTab,
} from "@/lib/admin/paths";
import {
  getReportReasonLabel,
  getReportStatusLabel,
  getReportTargetTypeLabel,
  parseReportReason,
} from "@/lib/admin/reports-shared";
import { resolveReportBanner } from "@/app/reports/report-banner";

describe("admin reports paths and helpers", () => {
  it("parses the reports workspace tab", () => {
    expect(parseAdminWorkspaceTab("reports")).toBe("reports");
  });

  it("builds reports href with normalized query parameters", () => {
    const href = buildAdminReportsHref({
      page: 2,
      status: "PENDING",
      targetType: "PUBLISHED_JOURNEY",
      reason: "SPAM",
    });

    expect(href).toBe(
      "/reports?page=2&status=PENDING&targetType=PUBLISHED_JOURNEY&reason=SPAM",
    );
  });

  it("omits page=1 from query parameters", () => {
    const href = buildAdminReportsHref({
      page: 1,
      status: "RESOLVED",
    });

    expect(href).toBe("/reports?status=RESOLVED");
  });

  it("builds report detail href with encoded report ID", () => {
    const href = buildAdminReportDetailHref("rep-123-uuid", {
      mutation: "report_updated",
    });

    expect(href).toBe("/reports/rep-123-uuid?mutation=report_updated");
  });

  it("returns human-readable labels for report statuses and reasons", () => {
    expect(getReportStatusLabel("PENDING")).toBe("Pending");
    expect(getReportStatusLabel("RESOLVED")).toBe("Resolved");
    expect(getReportReasonLabel("SPAM")).toBe("Spam");
    expect(getReportReasonLabel("ABUSE")).toBe("Abuse");
    expect(getReportReasonLabel("HATE")).toBe("Hate speech");
    expect(getReportReasonLabel("SEXUAL")).toBe("Sexual content");
    expect(getReportReasonLabel("INAPPROPRIATE")).toBe("Inappropriate");
    expect(getReportTargetTypeLabel("USER")).toBe("User Account");
    expect(getReportTargetTypeLabel("PUBLISHED_JOURNEY")).toBe("Published Journey");
  });

  it("parseReportReason drops unknown values", () => {
    expect(parseReportReason("HARASSMENT")).toBeUndefined();
    expect(parseReportReason("HATE")).toBe("HATE");
    expect(parseReportReason(null)).toBeUndefined();
  });

  it("resolves banner messages for report mutations and errors", () => {
    const updateBanner = resolveReportBanner({
      error: null,
      mutation: "report_updated",
      status: "RESOLVED",
    });
    expect(updateBanner).toEqual({
      tone: "success",
      message: "Report status updated to RESOLVED.",
    });

    const userBanBanner = resolveReportBanner({
      error: null,
      mutation: "user_status_updated",
      userStatus: "banned",
    });
    expect(userBanBanner).toEqual({
      tone: "success",
      message: "User has been banned and all active sessions revoked.",
    });

    const errorBanner = resolveReportBanner({
      error: "report_not_found",
    });
    expect(errorBanner).toEqual({
      tone: "error",
      message: "Report not found.",
    });
  });
});
