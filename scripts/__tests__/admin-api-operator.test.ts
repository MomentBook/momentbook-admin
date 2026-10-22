import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/configs/env.server", () => ({
  ENV: { API_BASE_URL: "https://api.test" },
}));

const fetchMock = vi.fn();

function okEnvelope(data: unknown) {
  return new Response(JSON.stringify({ status: "success", data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function call(index = 0) {
  const [url, init] = fetchMock.mock.calls[index] ?? [];
  return { url: url as string, method: (init?.method ?? "GET") as string, body: init?.body };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async () => okEnvelope({}));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("listAdminUsers", () => {
  it("sends filters and leaves out undefined params", async () => {
    const { listAdminUsers } = await import("@/lib/api/users");

    await listAdminUsers({ accessToken: "t", q: "kim", status: "BANNED", page: 1, limit: 20 });
    await listAdminUsers({ accessToken: "t", page: 2, limit: 10 });

    expect(call(0)).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users?q=kim&status=BANNED&page=1&limit=20",
    });
    expect(call(1).url).toBe("https://api.test/core/admin/users?page=2&limit=10");
  });
});

describe("getAdminUser", () => {
  it("encodes the user id", async () => {
    const { getAdminUser } = await import("@/lib/api/users");

    await getAdminUser({ accessToken: "t", userId: "a/b" });

    expect(call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users/a%2Fb",
    });
  });
});

describe("listAdminUserAuthEvents", () => {
  it("pages the auth events", async () => {
    const { listAdminUserAuthEvents } = await import("@/lib/api/users");

    await listAdminUserAuthEvents({ accessToken: "t", userId: "u-1", page: 3, limit: 25 });

    expect(call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users/u-1/auth-events?page=3&limit=25",
    });
  });
});

describe("revokeAdminUserSessions", () => {
  it("posts the reason", async () => {
    const { revokeAdminUserSessions } = await import("@/lib/api/users");

    await revokeAdminUserSessions({ accessToken: "t", userId: "u-1", reason: "abuse" });

    expect(call()).toMatchObject({
      method: "POST",
      url: "https://api.test/core/admin/users/u-1/sessions/revoke",
      body: '{"reason":"abuse"}',
    });
  });
});

describe("updateAdminUserStatus", () => {
  it("passes reportId through", async () => {
    const { updateAdminUserStatus } = await import("@/lib/api/users");

    await updateAdminUserStatus({
      accessToken: "t",
      userId: "u-1",
      data: { status: "banned", reportId: "r-1" },
    });

    expect(call().body).toBe('{"status":"banned","reportId":"r-1"}');
  });
});

describe("listAdminComments", () => {
  it("sends filters and leaves out undefined params", async () => {
    const { listAdminComments } = await import("@/lib/api/comments");

    await listAdminComments({ accessToken: "t", publicId: "p 1", status: "ACTIVE", page: 1, limit: 20 });

    expect(call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/comments?publicId=p+1&status=ACTIVE&page=1&limit=20",
    });
  });
});

describe("updateAdminCommentStatus", () => {
  it("patches the comment status", async () => {
    const { updateAdminCommentStatus } = await import("@/lib/api/comments");

    await updateAdminCommentStatus({
      accessToken: "t",
      commentId: "c-1",
      data: { status: "deleted", reason: "spam" },
    });

    expect(call()).toMatchObject({
      method: "PATCH",
      url: "https://api.test/core/admin/comments/c-1/status",
      body: '{"status":"deleted","reason":"spam"}',
    });
  });
});

describe("listAdminAuditLog", () => {
  it("sends filters and leaves out undefined params", async () => {
    const { listAdminAuditLog } = await import("@/lib/api/audit");

    await listAdminAuditLog({
      accessToken: "t",
      action: "USER_BANNED",
      subjectUserId: "u-1",
      page: 1,
      limit: 20,
    });

    expect(call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/audit-logs?action=USER_BANNED&subjectUserId=u-1&page=1&limit=20",
    });
  });
});

describe("getAdminMetrics", () => {
  it("sends days", async () => {
    const { getAdminMetrics } = await import("@/lib/api/metrics");

    await getAdminMetrics({ accessToken: "t", days: 30 });

    expect(call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/metrics?days=30",
    });
  });
});

describe("listPublishedJourneys", () => {
  it("sends the userId filter", async () => {
    const { listPublishedJourneys } = await import("@/lib/api/journeys");

    await listPublishedJourneys({ accessToken: "t", page: 1, limit: 20, userId: "u-1" });

    expect(call().url).toBe(
      "https://api.test/core/admin/journeys/publish?page=1&limit=20&userId=u-1",
    );
  });
});
