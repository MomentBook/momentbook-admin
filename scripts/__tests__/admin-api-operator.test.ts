import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFetchCall } from "./helpers/fetch-call";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  ENV: { API_BASE_URL: "https://api.test" },
}));

const fetchMock = vi.fn();

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function call(index = 0) {
  const { url, method, body } = await readFetchCall(fetchMock, index);
  return { url, method, body };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async () => ok({ items: [], total: 0, page: 1, limit: 20 }));
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

    expect(await call(0)).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users?q=kim&status=BANNED&page=1&limit=20",
    });
    expect((await call(1)).url).toBe("https://api.test/core/admin/users?page=2&limit=10");
  });
});

describe("getAdminUser", () => {
  it("encodes the user id", async () => {
    const { getAdminUser } = await import("@/lib/api/users");

    await getAdminUser({ accessToken: "t", userId: "a/b" });

    expect(await call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users/a%2Fb",
    });
  });
});

describe("listAdminUserAuthEvents", () => {
  it("pages the auth events", async () => {
    const { listAdminUserAuthEvents } = await import("@/lib/api/users");

    await listAdminUserAuthEvents({ accessToken: "t", userId: "u-1", page: 3, limit: 25 });

    expect(await call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/users/u-1/auth-events?page=3&limit=25",
    });
  });
});

describe("revokeAdminUserSessions", () => {
  it("posts the reason", async () => {
    const { revokeAdminUserSessions } = await import("@/lib/api/users");

    await revokeAdminUserSessions({ accessToken: "t", userId: "u-1", reason: "abuse" });

    expect(await call()).toMatchObject({
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
      data: { status: "BANNED", reportId: "r-1" },
    });

    expect((await call()).body).toBe('{"status":"BANNED","reportId":"r-1"}');
  });
});

describe("listAdminComments", () => {
  it("sends filters and leaves out undefined params", async () => {
    const { listAdminComments } = await import("@/lib/api/comments");

    await listAdminComments({ accessToken: "t", publicId: "p 1", status: "ACTIVE", page: 1, limit: 20 });

    expect(await call()).toMatchObject({
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
      data: { status: "DELETED", reason: "spam" },
    });

    expect(await call()).toMatchObject({
      method: "PATCH",
      url: "https://api.test/core/admin/comments/c-1/status",
      body: '{"status":"DELETED","reason":"spam"}',
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

    expect(await call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/audit-logs?action=USER_BANNED&subjectUserId=u-1&page=1&limit=20",
    });
  });
});

describe("getAdminMetrics", () => {
  it("sends days", async () => {
    const { getAdminMetrics } = await import("@/lib/api/metrics");

    await getAdminMetrics({ accessToken: "t", days: 30 });

    expect(await call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/metrics?days=30",
    });
  });
});

describe("operator list responses", () => {
  it("returns each v3 page with the derived pages and hasMore", async () => {
    fetchMock.mockImplementation(async () =>
      ok({ items: [{ id: "x" }], total: 21, page: 1, limit: 20 }),
    );
    const { listAdminUsers, listAdminUserAuthEvents } = await import("@/lib/api/users");
    const { listAdminComments } = await import("@/lib/api/comments");
    const { listAdminAuditLog } = await import("@/lib/api/audit");
    const { listAdminReports } = await import("@/lib/api/reports");
    const expected = {
      items: [{ id: "x" }],
      total: 21,
      page: 1,
      limit: 20,
      pages: 2,
      hasMore: true,
    };

    await expect(listAdminUsers({ accessToken: "t", page: 1, limit: 20 })).resolves.toEqual(expected);
    await expect(
      listAdminUserAuthEvents({ accessToken: "t", userId: "u-1", page: 1, limit: 20 }),
    ).resolves.toEqual(expected);
    await expect(listAdminComments({ accessToken: "t", page: 1, limit: 20 })).resolves.toEqual(
      expected,
    );
    await expect(listAdminAuditLog({ accessToken: "t", page: 1, limit: 20 })).resolves.toEqual(
      expected,
    );
    await expect(listAdminReports({ accessToken: "t", query: { page: 1 } })).resolves.toEqual(
      expected,
    );
  });
});

describe("getAdminMetrics response", () => {
  it("returns the v3 body as the metrics", async () => {
    const metrics = { generatedAt: "2026-11-10T00:00:00.000Z", days: 30, daily: [] };
    fetchMock.mockResolvedValueOnce(ok(metrics));
    const { getAdminMetrics } = await import("@/lib/api/metrics");

    await expect(getAdminMetrics({ accessToken: "t", days: 30 })).resolves.toEqual(metrics);
  });
});

describe("getAdminNotificationMetrics", () => {
  it("sends days to the notifications route", async () => {
    const { getAdminNotificationMetrics } = await import("@/lib/api/metrics");

    await getAdminNotificationMetrics({ accessToken: "t", days: 7 });

    expect(await call()).toMatchObject({
      method: "GET",
      url: "https://api.test/core/admin/metrics/notifications?days=7",
    });
  });
});

describe("listPublishedJourneys", () => {
  it("sends the userId filter", async () => {
    const { listPublishedJourneys } = await import("@/lib/api/journeys");

    await listPublishedJourneys({ accessToken: "t", page: 1, limit: 20, userId: "u-1" });

    expect((await call()).url).toBe(
      "https://api.test/core/admin/journeys/publish?page=1&limit=20&userId=u-1",
    );
  });
});
