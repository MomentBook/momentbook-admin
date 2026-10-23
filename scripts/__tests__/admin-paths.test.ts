import { describe, expect, it } from "vitest";
import {
  ADMIN_AUDIT_LOG_PATH,
  ADMIN_COMMENTS_PATH,
  ADMIN_METRICS_PATH,
  ADMIN_USERS_PATH,
  buildAdminAuditLogHref,
  buildAdminCommentsHref,
  buildAdminMetricsHref,
  buildAdminUserHref,
  buildAdminUsersHref,
  buildAdminArticleTableDetailHref,
  buildAdminArticleWorkspaceHref,
  buildAdminReportsHref,
  buildAdminReviewQueueHref,
  buildAdminSessionInvalidateHref,
  buildReviewDetailQueueLinks,
  buildAdminSessionRefreshHref,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { ADMIN_NAV_ITEMS } from "@/components/layout/admin-nav";

describe("admin session paths", () => {
  it("builds a refresh path with a sanitized admin return target", () => {
    expect(
      buildAdminSessionRefreshHref({
        next: "/?tab=reviews&page=2",
      }),
    ).toBe("/session/refresh?next=%2F%3Ftab%3Dreviews%26page%3D2");
  });

  it("drops non-admin refresh targets", () => {
    expect(
      buildAdminSessionRefreshHref({
        next: "https://example.com/phish",
      }),
    ).toBe("/session/refresh");
  });

  it("rejects paths that normalize to a protocol-relative URL", () => {
    for (const value of ["/.//evil.com", "/reviews/..//evil.com", "/%2e//evil.com"]) {
      expect(sanitizeAdminPath(value)).toBeNull();
    }
    expect(buildAdminSessionRefreshHref({ next: "/.//evil.com" })).toBe("/session/refresh");
  });

  it("keeps a normalized admin path", () => {
    expect(sanitizeAdminPath("/reviews/./public-1?status=all")).toBe("/reviews/public-1?status=all");
  });

  it("builds an invalidate path with a whitelisted error code", () => {
    expect(
      buildAdminSessionInvalidateHref({
        next: "/reviews/public-1",
        error: "admin_access_denied",
      }),
    ).toBe(
      "/session/invalidate?next=%2Freviews%2Fpublic-1&error=admin_access_denied",
    );
  });

  it("normalizes the admin article workspace query", () => {
    expect(
      buildAdminArticleWorkspaceHref({
        page: 1,
        status: "all",
        lang: " ko ",
        category: "festival",
      }),
    ).toBe("/articles?lang=ko&category=festival");
  });

  it("builds an article detail link with the current article workspace return target", () => {
    expect(
      buildAdminArticleTableDetailHref({
        articleId: "article-1",
        page: 3,
        status: "published",
        lang: "ko",
        category: "festival",
      }),
    ).toBe(
      "/articles/article-1?returnTo=%2Farticles%3Fpage%3D3%26status%3Dpublished%26lang%3Dko%26category%3Dfestival",
    );
  });
});

describe("admin review and report paths", () => {
  it("buildAdminReviewQueueHref omits defaults", () => {
    expect(buildAdminReviewQueueHref()).toBe("/reviews");
    expect(buildAdminReviewQueueHref({})).toBe("/reviews");
    expect(buildAdminReviewQueueHref({ status: "approved", page: 2 })).toBe(
      "/reviews?status=approved&page=2",
    );
    expect(buildAdminReviewQueueHref({ status: "pending", page: 1 })).toBe("/reviews");
    expect(buildAdminReviewQueueHref({ page: "3" })).toBe("/reviews?page=3");
    expect(
      buildAdminReviewQueueHref({
        entries: { targetPublicId: "p1", mutation: "review_updated", error: null },
      }),
    ).toBe("/reviews?targetPublicId=p1&mutation=review_updated");
  });

  it("buildAdminReportsHref keeps targetId and reporterId", () => {
    expect(
      buildAdminReportsHref({ targetType: "USER", targetId: "user-1", reporterId: "user-2" }),
    ).toBe("/reports?targetType=USER&targetId=user-1&reporterId=user-2");
  });
});

describe("operator surface paths", () => {
  it("exposes the new path constants", () => {
    expect(ADMIN_USERS_PATH).toBe("/users");
    expect(ADMIN_COMMENTS_PATH).toBe("/comments");
    expect(ADMIN_METRICS_PATH).toBe("/metrics");
    expect(ADMIN_AUDIT_LOG_PATH).toBe("/audit-log");
  });

  it("buildAdminUsersHref omits defaults", () => {
    expect(buildAdminUsersHref()).toBe("/users");
    expect(buildAdminUsersHref({ q: "kim", status: "banned", page: 1 })).toBe(
      "/users?q=kim&status=banned",
    );
    expect(buildAdminUsersHref({ role: "admin", page: 3, error: "user_not_found" })).toBe(
      "/users?role=admin&page=3&error=user_not_found",
    );
  });

  it("buildAdminUserHref encodes the id", () => {
    expect(buildAdminUserHref("u 1")).toBe("/users/u%201");
    expect(buildAdminUserHref("u1", { mutation: "sessions_revoked" })).toBe(
      "/users/u1?mutation=sessions_revoked",
    );
  });

  it("buildAdminCommentsHref omits empty values", () => {
    expect(buildAdminCommentsHref()).toBe("/comments");
    expect(buildAdminCommentsHref({ status: "deleted", userId: "u1", page: 2 })).toBe(
      "/comments?status=deleted&userId=u1&page=2",
    );
    expect(buildAdminCommentsHref({ publicId: "p1", mutation: "comment_deleted" })).toBe(
      "/comments?publicId=p1&mutation=comment_deleted",
    );
  });

  it("buildAdminMetricsHref omits unset days", () => {
    expect(buildAdminMetricsHref()).toBe("/metrics");
    expect(buildAdminMetricsHref({ days: 30 })).toBe("/metrics?days=30");
  });

  it("buildAdminAuditLogHref carries every filter", () => {
    expect(buildAdminAuditLogHref()).toBe("/audit-log");
    expect(
      buildAdminAuditLogHref({
        action: "USER_BANNED",
        actorId: "a1",
        subjectUserId: "s1",
        targetType: "USER",
        targetId: "t1",
        page: 2,
      }),
    ).toBe(
      "/audit-log?action=USER_BANNED&actorId=a1&subjectUserId=s1&targetType=USER&targetId=t1&page=2",
    );
  });

  it("the review queue href takes a userId filter", () => {
    expect(buildAdminReviewQueueHref({ status: "all", userId: "u1" })).toBe(
      "/reviews?status=all&userId=u1",
    );
  });

  it("review detail links keep the queue's tab, page and author filter", () => {
    expect(
      buildReviewDetailQueueLinks({
        publicId: "p-1",
        status: "all",
        page: 2,
        userId: "u1",
        lang: "ko-KR",
      }),
    ).toEqual({
      returnTo: "/reviews/p-1?lang=ko-KR&page=2&status=all&userId=u1",
      backHref: "/reviews?status=all&userId=u1&page=2",
      notFoundHref: "/reviews?status=all&userId=u1&page=2&error=review_target_not_found",
    });
  });

  it("review detail links from outside the queue go back to the pending queue", () => {
    expect(buildReviewDetailQueueLinks({ publicId: "p-1", status: null, page: 1 })).toEqual({
      returnTo: "/reviews/p-1",
      backHref: "/reviews",
      notFoundHref: "/reviews?error=review_target_not_found",
    });
  });

  it("nav order matches the spec", () => {
    expect(ADMIN_NAV_ITEMS.map((item) => item.key)).toEqual([
      "attention",
      "reviews",
      "reports",
      "comments",
      "users",
      "articles",
      "metrics",
      "audit",
    ]);
  });
});
