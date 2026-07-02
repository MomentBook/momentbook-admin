import { describe, expect, it } from "vitest";
import {
  buildAdminArticleTableDetailHref,
  buildAdminArticleWorkspaceHref,
  buildAdminSessionInvalidateHref,
  buildAdminSessionRefreshHref,
} from "@/lib/admin/paths";

describe("admin session paths", () => {
  it("builds a refresh path with a sanitized admin return target", () => {
    expect(
      buildAdminSessionRefreshHref({
        next: "/admin?tab=reviews&page=2",
      }),
    ).toBe("/admin/session/refresh?next=%2Fadmin%3Ftab%3Dreviews%26page%3D2");
  });

  it("drops non-admin refresh targets", () => {
    expect(
      buildAdminSessionRefreshHref({
        next: "https://example.com/phish",
      }),
    ).toBe("/admin/session/refresh");
  });

  it("builds an invalidate path with a whitelisted error code", () => {
    expect(
      buildAdminSessionInvalidateHref({
        next: "/admin/reviews/public-1",
        error: "admin_access_denied",
      }),
    ).toBe(
      "/admin/session/invalidate?next=%2Fadmin%2Freviews%2Fpublic-1&error=admin_access_denied",
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
    ).toBe("/admin/articles?lang=ko&category=festival");
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
      "/admin/articles/article-1?returnTo=%2Fadmin%2Farticles%3Fpage%3D3%26status%3Dpublished%26lang%3Dko%26category%3Dfestival",
    );
  });
});
