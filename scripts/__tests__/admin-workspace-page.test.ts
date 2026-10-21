import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isTestBackendApiError,
  TestBackendApiError,
} from "@/scripts/__fixtures__/admin-journeys";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((href: string) => {
  throw new Error(`REDIRECT:${href}`);
});
const cookies = vi.fn();
const requireAdminApiSession = vi.fn();
const loadAttentionCounts = vi.fn();
const loadAdminOverview = vi.fn();

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/api/client", () => ({
  BackendApiError: TestBackendApiError,
  isBackendApiError: isTestBackendApiError,
}));
vi.mock("@/lib/admin/session", () => ({ requireAdminApiSession }));
vi.mock("@/lib/admin/attention", () => ({ loadAttentionCounts }));
vi.mock("@/lib/admin/overview", () => ({ loadAdminOverview }));

const counts = {
  pendingReviews: 0,
  translationPending: 0,
  translationEnqueueFailed: 0,
  openReports: 0,
  pendingReports: 0,
  reviewedReports: 0,
  asOf: "2026-10-21T12:00:00.000Z",
};

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("AdminIndexPage", () => {
  it("legacy tab redirect", async () => {
    const { default: AdminIndexPage } = await import("@/app/page");

    await expect(
      AdminIndexPage({
        searchParams: Promise.resolve({ tab: "reviews", status: "all", page: "2" }),
      }),
    ).rejects.toThrow("REDIRECT:/reviews?status=all&page=2");
    await expect(
      AdminIndexPage({ searchParams: Promise.resolve({ tab: "live" }) }),
    ).rejects.toThrow("REDIRECT:/reviews");
    await expect(
      AdminIndexPage({ searchParams: Promise.resolve({ tab: "reports", status: "PENDING" }) }),
    ).rejects.toThrow("REDIRECT:/reports?status=PENDING");
    expect(requireAdminApiSession).not.toHaveBeenCalled();
  });
});

describe("loadWorkspacePage", () => {
  it("loadWorkspacePage maps 401 to session invalidate", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminApiSession.mockResolvedValue({ accessToken: "t" });
    loadAttentionCounts.mockResolvedValue(counts);
    const { loadWorkspacePage } = await import("@/app/_workspace/workspace-data");

    await expect(
      loadWorkspacePage({
        returnTo: "/reviews?status=approved",
        load: async () => {
          throw new TestBackendApiError("expired", 401);
        },
      }),
    ).rejects.toThrow(
      "REDIRECT:/session/invalidate?next=%2Freviews%3Fstatus%3Dapproved&error=session_expired",
    );
  });

  it("loadWorkspacePage maps a 403 from the counts to access denied", async () => {
    cookies.mockResolvedValue(new Map());
    requireAdminApiSession.mockResolvedValue({ accessToken: "t" });
    loadAttentionCounts.mockRejectedValue(new TestBackendApiError("denied", 403));
    const { loadWorkspacePage } = await import("@/app/_workspace/workspace-data");

    await expect(
      loadWorkspacePage({ returnTo: "/", load: async () => "data" }),
    ).rejects.toThrow("REDIRECT:/session/invalidate?next=%2F&error=admin_access_denied");
  });

  it("loadWorkspacePage passes the counts to the page loader", async () => {
    cookies.mockResolvedValue(new Map());
    const session = { accessToken: "t", email: "admin@example.com" };
    requireAdminApiSession.mockResolvedValue(session);
    loadAttentionCounts.mockResolvedValue(counts);
    const { loadWorkspacePage } = await import("@/app/_workspace/workspace-data");

    const result = await loadWorkspacePage({
      returnTo: "/reviews",
      load: async (accessToken, countsPromise) => ({
        accessToken,
        pending: (await countsPromise).pendingReviews,
      }),
    });

    expect(result).toEqual({ data: { accessToken: "t", pending: 0 }, counts, session });
    expect(loadAttentionCounts).toHaveBeenCalledWith("t");
  });
});
