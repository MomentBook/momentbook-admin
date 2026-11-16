import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFetchCall } from "./helpers/fetch-call";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  ENV: { API_BASE_URL: "https://api.test" },
}));

const fetchMock = vi.fn();

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type LooseCall = (
  path: string,
  init?: { headers?: Record<string, string>; body?: unknown },
) => Promise<{ data?: unknown }>;

/** The configured clients with their path types set aside, so the client's
 * own behavior is tested against a placeholder path. */
async function loadClient() {
  const client = await import("@/lib/api/client");
  const loose = (value: unknown) => value as { GET: LooseCall; POST: LooseCall; PATCH: LooseCall };

  return { ...client, core: loose(client.coreClient), auth: loose(client.authClient) };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("API client", () => {
  it("returns the 2xx body as the resource, with no envelope", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { userId: "u-1", revokedSessions: 2 }));
    const { bearer, core, dataOf } = await loadClient();

    await expect(dataOf(core.GET("/core/x", { headers: bearer("t") }))).resolves.toEqual({
      userId: "u-1",
      revokedSessions: 2,
    });
    const call = await readFetchCall(fetchMock);
    expect(call.url).toBe("https://api.test/core/x");
    expect(call).toMatchObject({
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json", Authorization: "Bearer t" },
    });
  });

  it("returns nothing for a 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { auth, dataOf } = await loadClient();

    await expect(dataOf(auth.POST("/auth/logout"))).resolves.toBeUndefined();
  });

  it("sends the extra headers it is given", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    const { core } = await loadClient();

    await core.GET("/core/x", { headers: { "Accept-Language": "ko-KR" } });

    expect((await readFetchCall(fetchMock)).headers).toMatchObject({
      Accept: "application/json",
      "Accept-Language": "ko-KR",
    });
  });

  it("rejects a 2xx whose body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
    const { core } = await loadClient();

    await expect(core.GET("/core/x")).rejects.toMatchObject({
      name: "BackendApiError",
      statusCode: 200,
    });
  });

  it("reads errorCode and message from the top level of an error body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, {
        statusCode: 400,
        errorCode: "REVIEW_STATE_CONFLICT",
        message: "The journey changed since it was loaded.",
      }),
    );
    const { core } = await loadClient();

    await expect(core.PATCH("/core/x", { body: {} })).rejects.toMatchObject({
      name: "BackendApiError",
      statusCode: 400,
      errorCode: "REVIEW_STATE_CONFLICT",
      message: "The journey changed since it was loaded.",
    });
  });

  it("leaves errorCode undefined when the error body has null", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(500, { statusCode: 500, errorCode: null, message: "Internal server error" }),
    );
    const { core } = await loadClient();

    const error = await core.GET("/core/x").catch((caught: unknown) => caught);

    expect(error).toMatchObject({ statusCode: 500, message: "Internal server error" });
    expect((error as { errorCode?: string }).errorCode).toBeUndefined();
  });

  it("maps 401 and 403 to the session errors", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { statusCode: 401, errorCode: null, message: "Expired" }))
      .mockResolvedValueOnce(jsonResponse(403, { statusCode: 403, errorCode: null, message: "Admins only" }));
    const { AdminAccessDeniedError, AdminSessionExpiredError, core } = await loadClient();

    const expired = await core.GET("/core/x").catch((caught: unknown) => caught);
    const denied = await core.GET("/core/x").catch((caught: unknown) => caught);

    expect(expired).toBeInstanceOf(AdminSessionExpiredError);
    expect(expired).toMatchObject({ statusCode: 401, message: "Expired" });
    expect(denied).toBeInstanceOf(AdminAccessDeniedError);
    expect(denied).toMatchObject({ statusCode: 403, message: "Admins only" });
  });

  it("falls back to the status in the message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad gateway", { status: 502 }));
    const { core } = await loadClient();

    await expect(core.GET("/core/x")).rejects.toMatchObject({
      statusCode: 502,
      message: "Request failed with status 502",
    });
  });
});

describe("withPageCounts", () => {
  it("derives pages and hasMore from total, page and limit", async () => {
    const { withPageCounts } = await import("@/lib/api/client");

    expect(withPageCounts({ items: [1], total: 41, page: 1, limit: 20 })).toEqual({
      items: [1],
      total: 41,
      page: 1,
      limit: 20,
      pages: 3,
      hasMore: true,
    });
    expect(withPageCounts({ items: [], total: 41, page: 3, limit: 20 })).toMatchObject({
      pages: 3,
      hasMore: false,
    });
  });

  it("has no pages when the total is 0", async () => {
    const { withPageCounts } = await import("@/lib/api/client");

    expect(withPageCounts({ items: [], total: 0, page: 1, limit: 20 })).toMatchObject({
      pages: 0,
      hasMore: false,
    });
  });
});
