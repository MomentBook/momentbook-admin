import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAdminSession: vi.fn(),
  cookies: vi.fn(),
  getStoredAdminSession: vi.fn(),
  refreshAdminSession: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/lib/admin/session", () => ({
  clearAdminSession: mocks.clearAdminSession,
  getStoredAdminSession: mocks.getStoredAdminSession,
  refreshAdminSession: mocks.refreshAdminSession,
}));

function useProductionCanonicalSiteUrl() {
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_IS_LOCAL: "false",
    NEXT_PUBLIC_ADMIN_SITE_URL: "https://admin.momentbook.app",
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.clearAllMocks();
  vi.resetModules();
});

describe("admin session routes", () => {
  it("redirects refresh requests without a session to the canonical admin origin", async () => {
    useProductionCanonicalSiteUrl();
    mocks.cookies.mockResolvedValue({});
    mocks.clearAdminSession.mockResolvedValue(undefined);
    mocks.getStoredAdminSession.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/session/refresh/route"
    );
    const response = await GET(
      new Request("https://localhost:3100/session/refresh?next=/"),
    );

    expect(response.headers.get("location")).toBe(
      "https://admin.momentbook.app/login?error=session_expired",
    );
    expect(response.headers.get("location")).not.toContain("localhost:3100");
  });

  it("redirects invalidate requests to the canonical admin origin", async () => {
    useProductionCanonicalSiteUrl();
    mocks.cookies.mockResolvedValue({});
    mocks.clearAdminSession.mockResolvedValue(undefined);

    const { GET } = await import(
      "@/app/session/invalidate/route"
    );
    const response = await GET(
      new Request(
        "https://localhost:3100/session/invalidate?next=/",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://admin.momentbook.app/login?error=session_expired",
    );
    expect(response.headers.get("location")).not.toContain("localhost:3100");
  });
});
