import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const listAdminAuditLog = vi.fn();

vi.mock("@/lib/api/audit", () => ({ listAdminAuditLog }));

const UUID = "123e4567-e89b-42d3-a456-426614174000";

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

type Item = import("@/src/apis/types").AdminAuditLogItemDto;

function item(overrides: Partial<Item>): Item {
  return {
    id: "a-1",
    action: "USER_BANNED",
    targetType: "USER",
    targetId: "t-1",
    subjectUserId: null,
    reason: null,
    details: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    actor: null,
    subject: null,
    ...overrides,
  };
}

describe("resolveAuditTargetHref", () => {
  it("links each target type to its admin page", async () => {
    const { resolveAuditTargetHref } = await import("@/lib/admin/audit-log-shared");
    const { buildAdminCommentsHref } = await import("@/lib/admin/paths");

    expect(resolveAuditTargetHref(item({ targetType: "USER", targetId: "u-1" }))).toBe("/users/u-1");
    expect(
      resolveAuditTargetHref(item({ targetType: "PUBLISHED_JOURNEY", targetId: "pub 1" })),
    ).toBe("/reviews/pub%201");
    expect(resolveAuditTargetHref(item({ targetType: "REPORT", targetId: "r-1" }))).toBe(
      "/reports/r-1",
    );
    expect(
      resolveAuditTargetHref(
        item({
          targetType: "COMMENT",
          action: "COMMENT_DELETED",
          targetId: "c-1",
          details: { publicId: "pub-1" },
        }),
      ),
    ).toBe(buildAdminCommentsHref({ publicId: "pub-1", status: "all" }));
    expect(
      resolveAuditTargetHref(
        item({ targetType: "ARTICLE", action: "ARTICLE_UPDATED", targetId: "art-1" }),
      ),
    ).toBe("/articles/art-1");
  });

  it("returns null for a comment without details.publicId and for a deleted article", async () => {
    const { resolveAuditTargetHref } = await import("@/lib/admin/audit-log-shared");

    expect(
      resolveAuditTargetHref(item({ targetType: "COMMENT", action: "COMMENT_DELETED", details: null })),
    ).toBeNull();
    expect(
      resolveAuditTargetHref(
        item({ targetType: "COMMENT", action: "COMMENT_DELETED", details: { publicId: 5 } }),
      ),
    ).toBeNull();
    expect(
      resolveAuditTargetHref(
        item({ targetType: "ARTICLE", action: "ARTICLE_DELETED", targetId: "art-1" }),
      ),
    ).toBeNull();
  });
});

describe("audit filters", () => {
  it("parsers keep known values and reject unknown ones", async () => {
    const { parseAuditActionFilter, parseAuditTargetTypeFilter, ADMIN_AUDIT_ACTION_LABELS } =
      await import("@/lib/admin/audit-log-shared");

    expect(parseAuditActionFilter("USER_BANNED")).toBe("USER_BANNED");
    expect(parseAuditActionFilter("user_banned")).toBeUndefined();
    expect(parseAuditActionFilter("NOPE")).toBeUndefined();
    expect(parseAuditActionFilter(undefined)).toBeUndefined();
    expect(parseAuditTargetTypeFilter("COMMENT")).toBe("COMMENT");
    expect(parseAuditTargetTypeFilter("JOURNEY")).toBeUndefined();
    expect(parseAuditTargetTypeFilter(null)).toBeUndefined();
    expect(Object.keys(ADMIN_AUDIT_ACTION_LABELS)).toHaveLength(11);
  });

  it("summarizes details as plain key: value text", async () => {
    const { summarizeAuditDetails } = await import("@/lib/admin/audit-log-shared");

    expect(summarizeAuditDetails(null)).toBeNull();
    expect(summarizeAuditDetails({})).toBeNull();
    expect(
      summarizeAuditDetails({ from: "ACTIVE", to: "BANNED", n: 2, skip: null, nested: { a: 1 } }),
    ).toBe('from: ACTIVE, to: BANNED, n: 2, nested: {"a":1}');
  });
});

describe("loadAdminAuditLogData", () => {
  it("passes every filter through and floors pages at 1", async () => {
    listAdminAuditLog.mockResolvedValue({
      actions: [],
      total: 0,
      page: 3,
      pages: 0,
      limit: 20,
      hasMore: false,
    });
    const { loadAdminAuditLogData } = await import("@/lib/admin/audit-log");

    const data = await loadAdminAuditLogData("token", {
      action: "REPORT_UPDATED",
      actorId: UUID,
      subjectUserId: UUID,
      targetType: "REPORT",
      targetId: "r-1",
      page: 3,
    });

    expect(listAdminAuditLog).toHaveBeenCalledWith({
      accessToken: "token",
      action: "REPORT_UPDATED",
      actorId: UUID,
      subjectUserId: UUID,
      targetType: "REPORT",
      targetId: "r-1",
      page: 3,
      limit: 20,
    });
    expect(data).toMatchObject({ actions: [], total: 0, page: 3, pages: 1 });
  });
});
