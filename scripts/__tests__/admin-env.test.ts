import { afterEach, describe, expect, it, vi } from "vitest";

// A production build that is not local, with every required variable set.
function stubValidProductionEnv() {
  vi.stubEnv("SKIP_ENV_VALIDATION", "");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_APP_IS_LOCAL", "false");
  vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_ADMIN_SITE_URL", "https://admin.momentbook.app");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.momentbook.app");
  vi.stubEnv("NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN", "https://cdn.momentbook.app");
  vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("admin env", () => {
  it("accepts a complete production configuration", async () => {
    stubValidProductionEnv();

    await expect(import("@/lib/env")).resolves.toBeDefined();
  });

  it("rejects an http admin URL when not local", async () => {
    stubValidProductionEnv();
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SITE_URL", "http://insecure.example");

    await expect(import("@/lib/env")).rejects.toThrow(/https/i);
  });

  it("rejects an http API URL when not local", async () => {
    stubValidProductionEnv();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://insecure.example");

    await expect(import("@/lib/env")).rejects.toThrow(/https/i);
  });

  it("allows http URLs when the build is local", async () => {
    stubValidProductionEnv();
    vi.stubEnv("NEXT_PUBLIC_APP_IS_LOCAL", "true");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SITE_URL", "http://localhost:3200");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");

    await expect(import("@/lib/env")).resolves.toBeDefined();
  });

  it("rejects a missing session secret", async () => {
    stubValidProductionEnv();
    vi.stubEnv("ADMIN_SESSION_SECRET", "   ");

    await expect(import("@/lib/env")).rejects.toThrow(/environment variables/i);
  });

  it("skips validation when SKIP_ENV_VALIDATION is true", async () => {
    stubValidProductionEnv();
    vi.stubEnv("SKIP_ENV_VALIDATION", "true");
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SITE_URL", "http://insecure.example");

    await expect(import("@/lib/env")).resolves.toBeDefined();
  });

  it("exposes ENV with the same keys and values as before", async () => {
    stubValidProductionEnv();
    vi.stubEnv("NEXT_PUBLIC_APP_IS_LOCAL", "yes");

    const { ENV } = await import("@/lib/env");

    expect(ENV).toEqual({
      APP_ENV: "production",
      APP_IS_LOCAL: true,
      ADMIN_SITE_URL: "https://admin.momentbook.app",
      API_BASE_URL: "https://api.momentbook.app",
      PUBLIC_IMAGE_ORIGIN: "https://cdn.momentbook.app",
      ADMIN_SESSION_SECRET: "test-session-secret",
    });
  });
});
