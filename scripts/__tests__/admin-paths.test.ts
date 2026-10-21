import { describe, expect, it } from "vitest";
import {
  buildAdminArticleTableDetailHref,
  buildAdminArticleWorkspaceHref,
  buildAdminReportsHref,
  buildAdminReviewQueueHref,
  buildAdminSessionInvalidateHref,
  buildAdminSessionRefreshHref,
} from "@/lib/admin/paths";

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
