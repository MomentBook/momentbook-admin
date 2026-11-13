import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const listAdminUsers = vi.fn();
vi.mock("@/lib/api/users", () => ({ listAdminUsers }));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("user directory parsers", () => {
  it("parseUserSearchQuery trims and bounds the query", async () => {
    const { parseUserSearchQuery } = await import("@/lib/admin/users-shared");

    expect(parseUserSearchQuery(" a ")).toBeUndefined();
    expect(parseUserSearchQuery(undefined)).toBeUndefined();
    expect(parseUserSearchQuery(" kim ")).toBe("kim");
    expect(parseUserSearchQuery("kim")).toBe("kim");
    expect(parseUserSearchQuery("a".repeat(200))).toBe("a".repeat(200));
    expect(parseUserSearchQuery("a".repeat(201))).toBeUndefined();
  });

  it("parseUserStatusFilter maps URL values to API enums", async () => {
    const { parseUserStatusFilter } = await import("@/lib/admin/users-shared");

    expect(parseUserStatusFilter("banned")).toBe("BANNED");
    expect(parseUserStatusFilter("active")).toBe("ACTIVE");
    expect(parseUserStatusFilter("inactive")).toBe("INACTIVE");
    expect(parseUserStatusFilter("deleted")).toBe("DELETED");
    expect(parseUserStatusFilter("pending_deletion")).toBe("PENDING_DELETION");
    expect(parseUserStatusFilter("x")).toBeUndefined();
    expect(parseUserStatusFilter("BANNED")).toBeUndefined();
    expect(parseUserStatusFilter(undefined)).toBeUndefined();
  });

  it("shows a scheduled deletion with its own label and the outline badge", async () => {
    const { USER_STATUS_LABELS, userStatusBadgeVariant } = await import("@/lib/admin/users-shared");

    expect(USER_STATUS_LABELS.PENDING_DELETION).toBe("Deletion scheduled");
    expect(userStatusBadgeVariant("PENDING_DELETION")).toBe("outline");
  });

  it("parseUserRoleFilter only accepts admin", async () => {
    const { parseUserRoleFilter } = await import("@/lib/admin/users-shared");

    expect(parseUserRoleFilter("admin")).toBe("ADMIN");
    expect(parseUserRoleFilter("user")).toBeUndefined();
    expect(parseUserRoleFilter(undefined)).toBeUndefined();
  });

  it("resolveUserSearch ignores, with a notice, any q the API would reject", async () => {
    const { resolveUserSearch } = await import("@/lib/admin/users-shared");

    expect(resolveUserSearch(" ")).toEqual({ ignored: true });
    expect(resolveUserSearch("a")).toEqual({ ignored: true });
    expect(resolveUserSearch("a".repeat(201))).toEqual({ ignored: true });
    expect(resolveUserSearch("kim")).toEqual({ q: "kim", ignored: false });
    expect(resolveUserSearch(" kim ")).toEqual({ q: "kim", ignored: false });
    expect(resolveUserSearch(undefined)).toEqual({ ignored: false });
    expect(resolveUserSearch(null)).toEqual({ ignored: false });
    // The search form submits an empty q; that is no search, not a bad one.
    expect(resolveUserSearch("")).toEqual({ ignored: false });
  });
});

describe("loadAdminUsersWorkspaceData", () => {
  it("passes filters through with the page size and normalizes the result", async () => {
    listAdminUsers.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      limit: 20,
      pages: 0,
      hasMore: false,
    });
    const { loadAdminUsersWorkspaceData } = await import("@/lib/admin/users");

    const result = await loadAdminUsersWorkspaceData("token", {
      q: "kim",
      status: "BANNED",
      role: "ADMIN",
      page: 2,
    });

    expect(listAdminUsers).toHaveBeenCalledWith({
      accessToken: "token",
      q: "kim",
      status: "BANNED",
      role: "ADMIN",
      page: 2,
      limit: 20,
    });
    expect(result).toMatchObject({ total: 0, page: 2, pages: 1, users: [] });
  });
});

describe("deletion reason labels", () => {
  it("labels each code the API sends", async () => {
    const { deletionReasonLabel } = await import("@/lib/admin/users-shared");

    expect(deletionReasonLabel("NOT_USING")).toBe("Doesn't use it");
    expect(deletionReasonLabel("HARD_TO_USE")).toBe("Hard to use");
    expect(deletionReasonLabel("MISSING_FEATURE")).toBe("Missing a feature");
    expect(deletionReasonLabel("PRIVACY")).toBe("Privacy concern");
    expect(deletionReasonLabel("NEW_ACCOUNT")).toBe("Switching account");
    expect(deletionReasonLabel("OTHER")).toBe("Other");
  });

  it("reads no code as not given", async () => {
    const { deletionReasonLabel } = await import("@/lib/admin/users-shared");

    expect(deletionReasonLabel(null)).toBe("Not given");
  });

  it("humanizes a code it does not know", async () => {
    const { deletionReasonLabel, humanizeEnum } = await import("@/lib/admin/users-shared");

    expect(deletionReasonLabel("TOO_EXPENSIVE")).toBe("Too expensive");
    expect(humanizeEnum("USER_SESSIONS_REVOKED")).toBe("User sessions revoked");
  });
});
