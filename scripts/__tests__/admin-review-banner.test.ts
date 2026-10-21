import { describe, expect, it } from "vitest";
import { resolveReviewBanner } from "@/app/reviews/review-banner";
import { resolveUserStatusBanner } from "@/app/_workspace/user-status-banner";

const noBanner = { error: null, mutation: null, reviewStatus: null, targetPublicId: null };

describe("resolveReviewBanner", () => {
  it("names the outcome and offers undo for approve and reject", () => {
    expect(
      resolveReviewBanner({
        ...noBanner,
        mutation: "review_updated",
        reviewStatus: "APPROVED",
        targetPublicId: "p1",
      }),
    ).toEqual({ tone: "success", message: "p1 approved.", undoPublicId: "p1" });
    expect(
      resolveReviewBanner({
        ...noBanner,
        mutation: "review_updated",
        reviewStatus: "REJECTED",
        targetPublicId: "p1",
      }),
    ).toEqual({ tone: "success", message: "p1 rejected.", undoPublicId: "p1" });
    expect(
      resolveReviewBanner({
        ...noBanner,
        mutation: "review_updated",
        reviewStatus: "PENDING",
        targetPublicId: "p1",
      }),
    ).toEqual({ tone: "success", message: "p1 moved back to pending." });
  });

  it("explains an unavailable translation queue", () => {
    expect(resolveReviewBanner({ ...noBanner, error: "review_requeue_unavailable" })).toEqual({
      tone: "error",
      message: "Translation queue unavailable. Nothing changed — try again.",
    });
  });

  it("keeps the conflict explanation", () => {
    expect(resolveReviewBanner({ ...noBanner, error: "review_state_conflict" })?.message).toBe(
      "The owner republished this journey after you opened it. Review the current version and decide again.",
    );
  });

  it("returns null without a mutation or error", () => {
    expect(resolveReviewBanner(noBanner)).toBeNull();
  });
});

describe("resolveUserStatusBanner", () => {
  const base = { mutation: "user_status_updated", error: null, message: null };

  it("describes each resulting account status", () => {
    expect(resolveUserStatusBanner({ ...base, userStatus: "banned" })).toEqual({
      tone: "success",
      message: "User has been banned and all active sessions revoked.",
    });
    expect(resolveUserStatusBanner({ ...base, userStatus: "active" })).toEqual({
      tone: "success",
      message: "Ban lifted.",
    });
    expect(resolveUserStatusBanner({ ...base, userStatus: "inactive" })).toEqual({
      tone: "success",
      message: "Ban lifted. The account stays inactive until it accepts the required consents.",
    });
  });

  it("shows the API message for a failed update", () => {
    expect(
      resolveUserStatusBanner({
        mutation: null,
        userStatus: null,
        error: "user_update_failed",
        message: "Cannot change an admin account.",
      }),
    ).toEqual({ tone: "error", message: "Cannot change an admin account." });
    expect(
      resolveUserStatusBanner({ mutation: null, userStatus: null, error: "user_update_failed", message: null }),
    ).toEqual({ tone: "error", message: "Could not update the user. Try again." });
  });

  it("returns null for unrelated keys", () => {
    expect(
      resolveUserStatusBanner({ mutation: "review_updated", userStatus: null, error: null, message: null }),
    ).toBeNull();
  });
});
