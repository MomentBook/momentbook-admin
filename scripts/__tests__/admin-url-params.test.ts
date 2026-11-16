import { parseAsString } from "nuqs/server";
import { describe, expect, it } from "vitest";

import { resolveFlash, type FlashMessages, type FlashQuery } from "@/lib/navigation/flash";
import { createAdminSerializer, loadFlashParams } from "@/lib/navigation/params";
import { buildAdminSessionRefreshHref, sanitizeAdminPath } from "@/lib/navigation/paths";
import { buildAdminReportsHref, loadReportsParams } from "@/lib/navigation/report-routes";
import {
  buildAdminReviewDetailHref,
  buildAdminReviewQueueHref,
  buildReviewDetailQueueLinks,
  loadReviewDetailParams,
  loadReviewQueueParams,
} from "@/lib/navigation/review-routes";

const UUID = "00000000-0000-7000-8000-00000000de01";

function searchOf(href: string): URLSearchParams {
  return new URL(href, "https://admin.local").searchParams;
}

describe("review queue params", () => {
  // Each expected value is what parseReviewQueueTab, parseReviewQueuePage and
  // parseUuidFilter returned for the same query (no author filter is null).
  it.each([
    ["", { status: "pending", userId: null, page: 1 }],
    ["?page=abc", { status: "pending", userId: null, page: 1 }],
    ["?page=0", { status: "pending", userId: null, page: 1 }],
    ["?page=-3", { status: "pending", userId: null, page: 1 }],
    ["?page=2.5", { status: "pending", userId: null, page: 1 }],
    ["?page=999999", { status: "pending", userId: null, page: 100000 }],
    ["?page=%207%20", { status: "pending", userId: null, page: 7 }],
    ["?status=unknown", { status: "pending", userId: null, page: 1 }],
    ["?status=translation&page=3", { status: "translation", userId: null, page: 3 }],
    [`?status=all&userId=%20${UUID}%20`, { status: "all", userId: UUID, page: 1 }],
    ["?userId=not-a-uuid", { status: "pending", userId: null, page: 1 }],
  ])("parses %j the same way as before", (query, expected) => {
    expect(loadReviewQueueParams(query)).toMatchObject(expected);
  });

  it("reads the first value of a repeated key, as readQueryParam did", () => {
    expect(loadReviewQueueParams({ page: ["2", "5"] }).page).toBe(2);
  });

  it("serializes the pending tab and page 1 away", () => {
    expect(buildAdminReviewQueueHref({ status: "pending", page: 1, userId: null })).toBe("/reviews");
    expect(buildAdminReviewQueueHref({ status: "approved", page: 2 })).toBe(
      "/reviews?status=approved&page=2",
    );
    expect(
      buildAdminReviewQueueHref({
        status: "all",
        userId: "u1",
        page: 2,
        entries: { error: "review_target_not_found" },
      }),
    ).toBe("/reviews?status=all&userId=u1&page=2&error=review_target_not_found");
  });

  it("names the detail's queue context only when the URL does", () => {
    expect(loadReviewDetailParams("?status=pending").status).toBe("pending");
    expect(loadReviewDetailParams("?status=unknown").status).toBeNull();
    expect(loadReviewDetailParams("").status).toBeNull();
  });

  it("builds the detail URL in its own key order", () => {
    expect(
      buildReviewDetailQueueLinks({
        publicId: "p-1",
        lang: "ko-KR",
        page: 2,
        status: "all",
        userId: "u1",
      }).returnTo,
    ).toBe("/reviews/p-1?lang=ko-KR&page=2&status=all&userId=u1");
    expect(buildAdminReviewDetailHref("p 1")).toBe("/reviews/p%201");
  });
});

describe("reports params", () => {
  // Expected values are what the reports page's own parsers returned.
  it.each([
    ["", { page: 1, status: null, targetType: null, reason: null, targetId: null, reporterId: null }],
    [
      "?page=3&status=RESOLVED&targetType=USER&reason=SPAM",
      { page: 3, status: "RESOLVED", targetType: "USER", reason: "SPAM" },
    ],
    [
      "?status=closed&targetType=COMMENT&reason=HARASSMENT",
      { status: null, targetType: null, reason: null },
    ],
    ["?targetId=%20journey-1%20", { targetId: "journey-1" }],
    ["?targetId=%20%20", { targetId: null }],
    [`?reporterId=%20${UUID}%20`, { reporterId: UUID }],
    ["?reporterId=abc", { reporterId: null }],
  ])("parses %j the same way as before", (query, expected) => {
    expect(loadReportsParams(query)).toMatchObject(expected);
  });

  it("pages like the review queue: whole numbers from 1 to 100000", () => {
    expect(loadReportsParams("?page=2.7").page).toBe(1);
    expect(loadReportsParams("?page=999999").page).toBe(100000);
  });

  it("puts the page first and leaves empty filters out", () => {
    expect(
      buildAdminReportsHref({ targetType: "USER", targetId: "user-1", reporterId: "user-2" }),
    ).toBe("/reports?targetType=USER&targetId=user-1&reporterId=user-2");
    expect(buildAdminReportsHref({ page: 2, status: "PENDING", reason: null })).toBe(
      "/reports?page=2&status=PENDING",
    );
  });

  it("returnTo round-trips through sanitizeAdminPath", () => {
    const filters = {
      page: 3,
      status: "PENDING",
      targetType: "PUBLISHED_JOURNEY",
      reason: "SPAM",
      targetId: "journey 1/2",
      reporterId: UUID,
    } as const;
    const returnTo = buildAdminReportsHref(filters);

    expect(sanitizeAdminPath(returnTo)).toBe(returnTo);

    const next = searchOf(buildAdminSessionRefreshHref({ next: returnTo })).get("next");
    expect(next).toBe(returnTo);
    expect(loadReportsParams(searchOf(next ?? ""))).toMatchObject(filters);
  });
});

describe("createAdminSerializer", () => {
  it("spells values as URLSearchParams does", () => {
    // nuqs on its own leaves `@`, `/`, `?` and `=` as they are.
    const serialize = createAdminSerializer({ q: parseAsString, next: parseAsString });

    expect(serialize("/users", { q: "kim@example.com", next: "/reviews?status=all" })).toBe(
      "/users?q=kim%40example.com&next=%2Freviews%3Fstatus%3Dall",
    );
  });

  it("keeps the keys already on the path unless a value replaces or clears them", () => {
    const serialize = createAdminSerializer({ q: parseAsString, error: parseAsString });

    expect(serialize("/users?role=admin&error=old", { q: "lee", error: null })).toBe(
      "/users?role=admin&q=lee",
    );
  });
});

describe("flash", () => {
  type Query = FlashQuery & { revokedSessions?: string | null; targetPublicId?: string | null };

  const messages: FlashMessages<Query> = {
    mutations: {
      comment_deleted: "Comment hidden from the journey.",
      sessions_revoked: (query) =>
        query.revokedSessions === "0"
          ? { tone: "default", message: "No active session to end." }
          : "Signed out.",
      review_updated: (query) =>
        query.targetPublicId ? `${query.targetPublicId} approved.` : null,
    },
    errors: {
      comment_not_found: "That comment no longer exists.",
      comment_update_failed: (query) =>
        query.message || "Could not delete the comment. Try again.",
    },
  };

  it("resolveFlash returns null without mutation or error", () => {
    expect(resolveFlash({ mutation: null, error: null }, messages)).toBeNull();
  });

  it("a sentence is a success banner for a mutation and an error banner for an error", () => {
    expect(resolveFlash({ mutation: "comment_deleted" }, messages)).toEqual({
      tone: "success",
      message: "Comment hidden from the journey.",
    });
    expect(resolveFlash({ error: "comment_not_found" }, messages)).toEqual({
      tone: "error",
      message: "That comment no longer exists.",
    });
  });

  it("a function reads the rest of the query, may pick another tone, or declines", () => {
    expect(resolveFlash({ mutation: "sessions_revoked", revokedSessions: "0" }, messages)).toEqual({
      tone: "default",
      message: "No active session to end.",
    });
    expect(resolveFlash({ error: "comment_update_failed", message: "Boom" }, messages)).toEqual({
      tone: "error",
      message: "Boom",
    });
    expect(
      resolveFlash({ mutation: "review_updated", error: "comment_not_found" }, messages),
    ).toEqual({ tone: "error", message: "That comment no longer exists." });
  });

  it("ignores codes the table does not list, inherited names included", () => {
    expect(resolveFlash({ mutation: "unknown", error: "toString" }, messages)).toBeNull();
  });

  it("loads the flash keys as the page received them", () => {
    expect(loadFlashParams("?mutation=comment_deleted&message=Boom+again")).toEqual({
      mutation: "comment_deleted",
      error: null,
      message: "Boom again",
    });
  });
});
