import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isTestBackendApiError,
  TestBackendApiError,
} from "@/scripts/__fixtures__/admin-journeys";

vi.mock("server-only", () => ({}));

const getAdminUser = vi.fn();
const listAdminUserAuthEvents = vi.fn();
const listAdminComments = vi.fn();
const listAdminAuditLog = vi.fn();
const listPublishedJourneys = vi.fn();
const listAdminReports = vi.fn();

vi.mock("@/lib/api/client", () => ({
  BackendApiError: TestBackendApiError,
  isBackendApiError: isTestBackendApiError,
}));
vi.mock("@/lib/api/users", () => ({ getAdminUser, listAdminUserAuthEvents }));
vi.mock("@/lib/api/comments", () => ({ listAdminComments }));
vi.mock("@/lib/api/audit", () => ({ listAdminAuditLog }));
vi.mock("@/lib/api/journeys", () => ({ listPublishedJourneys }));
vi.mock("@/lib/api/reports", () => ({
  listAdminReports,
  getAdminReport: vi.fn(),
  getAdminReportStats: vi.fn(),
}));

const page = { total: 0, page: 1, pages: 1, limit: 5, hasMore: false };
const detail = { profile: { userId: "u-1" }, counts: {} };
const moderation = { actions: [{ id: "a-1" }], ...page, total: 1 };
const journeys = { journeys: [{ publicId: "p-1" }], ...page, total: 1 };
const comments = { comments: [{ commentId: "c-1" }], ...page, total: 1 };
const authEvents = { events: [{ id: "e-1" }], ...page, total: 1 };
const receivedReport = { _id: "r-received" };
const filedReport = { _id: "r-filed" };

function mockAllOk() {
  getAdminUser.mockResolvedValue(detail);
  listAdminAuditLog.mockResolvedValue(moderation);
  listPublishedJourneys.mockResolvedValue(journeys);
  listAdminComments.mockResolvedValue(comments);
  listAdminUserAuthEvents.mockResolvedValue(authEvents);
  listAdminReports.mockImplementation(async (input: { query: { reporterId?: string } }) =>
    input.query.reporterId
      ? { reports: [filedReport], ...page, total: 1 }
      : { reports: [receivedReport], ...page, total: 2 },
  );
}

async function loadModule() {
  return import("@/lib/admin/users");
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("loadAdminUserDetailWorkspaceData", () => {
  it("fills every section when all calls succeed", async () => {
    mockAllOk();
    const { loadAdminUserDetailWorkspaceData } = await loadModule();

    const result = await loadAdminUserDetailWorkspaceData("t", "u-1");

    expect(result).toEqual({
      detail,
      moderation,
      journeys,
      comments,
      reportsReceived: { items: [receivedReport], total: 2 },
      reportsFiled: { items: [filedReport], total: 1 },
      authEvents,
    });
    expect(getAdminUser).toHaveBeenCalledWith({ accessToken: "t", userId: "u-1" });
    expect(listAdminAuditLog).toHaveBeenCalledWith({
      accessToken: "t",
      subjectUserId: "u-1",
      page: 1,
      limit: 10,
    });
    expect(listPublishedJourneys).toHaveBeenCalledWith({
      accessToken: "t",
      userId: "u-1",
      page: 1,
      limit: 5,
    });
    expect(listAdminComments).toHaveBeenCalledWith({
      accessToken: "t",
      userId: "u-1",
      page: 1,
      limit: 5,
    });
    expect(listAdminUserAuthEvents).toHaveBeenCalledWith({
      accessToken: "t",
      userId: "u-1",
      page: 1,
      limit: 10,
    });
    expect(listAdminReports).toHaveBeenCalledWith({
      accessToken: "t",
      query: { page: 1, limit: 5, targetType: "USER", targetId: "u-1" },
    });
    expect(listAdminReports).toHaveBeenCalledWith({
      accessToken: "t",
      query: { page: 1, limit: 5, reporterId: "u-1" },
    });
  });

  it("a failing secondary section becomes null and leaves the others intact", async () => {
    mockAllOk();
    listAdminComments.mockRejectedValue(new TestBackendApiError("boom", 500));
    const { loadAdminUserDetailWorkspaceData } = await loadModule();

    const result = await loadAdminUserDetailWorkspaceData("t", "u-1");

    expect(result.comments).toBeNull();
    expect(result).toMatchObject({
      detail,
      moderation,
      journeys,
      authEvents,
      reportsReceived: { total: 2 },
      reportsFiled: { total: 1 },
    });
  });

  it("an expired session in a secondary section still rejects", async () => {
    mockAllOk();
    listAdminAuditLog.mockRejectedValue(new TestBackendApiError("expired", 401));
    const { loadAdminUserDetailWorkspaceData } = await loadModule();

    await expect(loadAdminUserDetailWorkspaceData("t", "u-1")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("a denied session in a secondary section still rejects", async () => {
    mockAllOk();
    listAdminUserAuthEvents.mockRejectedValue(new TestBackendApiError("denied", 403));
    const { loadAdminUserDetailWorkspaceData } = await loadModule();

    await expect(loadAdminUserDetailWorkspaceData("t", "u-1")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("a missing user rejects with the 404", async () => {
    mockAllOk();
    getAdminUser.mockRejectedValue(new TestBackendApiError("User not found", 404));
    const { loadAdminUserDetailWorkspaceData } = await loadModule();

    await expect(loadAdminUserDetailWorkspaceData("t", "u-1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("resolveUserBanner", () => {
  async function resolve(params: Record<string, string | null>) {
    const { resolveUserBanner } = await import("@/app/users/user-banner");

    return resolveUserBanner({
      mutation: null,
      error: null,
      message: null,
      revokedSessions: null,
      userStatus: null,
      ...params,
    });
  }

  it("sessions_revoked with no session says there was nothing to end", async () => {
    expect(await resolve({ mutation: "sessions_revoked", revokedSessions: "0" })).toMatchObject({
      message: "No active session to end.",
    });
  });

  it("sessions_revoked with a session says the account was signed out", async () => {
    expect(await resolve({ mutation: "sessions_revoked", revokedSessions: "1" })).toEqual({
      tone: "success",
      message: "Signed out. The account must sign in again.",
    });
  });

  it("sign-out failure shows the API message", async () => {
    expect(
      await resolve({ error: "sessions_revoke_failed", message: "Cannot sign out an admin." }),
    ).toEqual({ tone: "error", message: "Cannot sign out an admin." });
  });

  it("user_not_found is an error", async () => {
    expect(await resolve({ error: "user_not_found" })).toMatchObject({ tone: "error" });
  });

  it("falls back to the ban/unban banner", async () => {
    expect(
      await resolve({ mutation: "user_status_updated", userStatus: "banned" }),
    ).toMatchObject({ tone: "success", message: expect.stringContaining("banned") });
  });

  it("returns null without a known code", async () => {
    expect(await resolve({})).toBeNull();
  });
});
