import { describe, expect, it } from "vitest";

const group = (
  store: "APPLE" | "GOOGLE",
  environment: "PRODUCTION" | "SANDBOX",
  state: string,
  count: number,
  planKey = "plus",
) => ({ store, environment, state, planKey, count });

describe("subscriptionStateLabel and subscriptionStateTone", () => {
  it("names each state the server stores, with a tone", async () => {
    const { subscriptionStateLabel, subscriptionStateTone } = await import(
      "@/lib/admin/subscriptions-shared"
    );

    expect(subscriptionStateLabel("ACTIVE")).toBe("Active");
    expect(subscriptionStateLabel("GRACE")).toBe("Grace period");
    expect(subscriptionStateLabel("ON_HOLD")).toBe("On hold");
    expect(subscriptionStateLabel("PAUSED")).toBe("Paused");
    expect(subscriptionStateLabel("EXPIRED")).toBe("Expired");
    expect(subscriptionStateLabel("REVOKED")).toBe("Refunded or revoked");

    expect(subscriptionStateTone("ACTIVE")).toBe("ok");
    expect(subscriptionStateTone("GRACE")).toBe("attention");
    expect(subscriptionStateTone("ON_HOLD")).toBe("attention");
    expect(subscriptionStateTone("PAUSED")).toBe("attention");
    expect(subscriptionStateTone("EXPIRED")).toBe("over");
    expect(subscriptionStateTone("REVOKED")).toBe("over");
  });

  it("shows a state it does not know as it came, and asks for attention", async () => {
    const { subscriptionStateLabel, subscriptionStateTone } = await import(
      "@/lib/admin/subscriptions-shared"
    );

    expect(subscriptionStateLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
    expect(subscriptionStateTone("SOMETHING_NEW")).toBe("attention");
  });
});

describe("storeLabel and periodLabel", () => {
  it("names the stores and the periods", async () => {
    const { storeLabel, periodLabel } = await import("@/lib/admin/subscriptions-shared");

    expect(storeLabel("APPLE")).toBe("App Store");
    expect(storeLabel("GOOGLE")).toBe("Google Play");
    expect(storeLabel("AMAZON")).toBe("AMAZON");
    expect(periodLabel("MONTHLY")).toBe("Monthly");
    expect(periodLabel("YEARLY")).toBe("Yearly");
    expect(periodLabel(null)).toBe("—");
  });
});

describe("periodEndLabel", () => {
  it("says what the date of a subscription means for its state", async () => {
    const { periodEndLabel } = await import("@/lib/admin/subscriptions-shared");

    expect(periodEndLabel({ state: "ACTIVE", autoRenew: true })).toBe("Renews");
    expect(periodEndLabel({ state: "ACTIVE", autoRenew: false })).toBe("Cancelled, paid until");
    expect(periodEndLabel({ state: "GRACE", autoRenew: true })).toBe("Grace period until");
    expect(periodEndLabel({ state: "ON_HOLD", autoRenew: true })).toBe("Paid period ended");
    expect(periodEndLabel({ state: "PAUSED", autoRenew: true })).toBe("Paid period ended");
    expect(periodEndLabel({ state: "EXPIRED", autoRenew: false })).toBe("Ended");
    // A refund in the middle of a period leaves a date that is still ahead.
    expect(periodEndLabel({ state: "REVOKED", autoRenew: false })).toBe("Paid period was until");
    expect(periodEndLabel({ state: "SOMETHING_NEW", autoRenew: true })).toBe("Period end");
  });
});

describe("canAskStoreAgain", () => {
  it("is true while a subscription can still change in its store", async () => {
    const { canAskStoreAgain } = await import("@/lib/admin/subscriptions-shared");

    for (const state of ["ACTIVE", "GRACE", "ON_HOLD", "PAUSED"]) {
      expect(canAskStoreAgain([{ state: "EXPIRED" }, { state }])).toBe(true);
    }
  });

  it("is false when every subscription has ended, or there is none: the server asks about neither", async () => {
    const { canAskStoreAgain } = await import("@/lib/admin/subscriptions-shared");

    expect(canAskStoreAgain([{ state: "EXPIRED" }, { state: "REVOKED" }])).toBe(false);
    expect(canAskStoreAgain([])).toBe(false);
    expect(canAskStoreAgain([{ state: "SOMETHING_NEW" }])).toBe(false);
  });
});

describe("summarizeSubscriptionGroups", () => {
  it("counts production subscriptions by what they do, and test purchases apart", async () => {
    const { summarizeSubscriptionGroups } = await import("@/lib/admin/subscriptions-shared");

    const summary = summarizeSubscriptionGroups([
      group("APPLE", "PRODUCTION", "ACTIVE", 12),
      group("GOOGLE", "PRODUCTION", "ACTIVE", 5),
      group("GOOGLE", "PRODUCTION", "GRACE", 1),
      group("APPLE", "PRODUCTION", "ON_HOLD", 2),
      group("GOOGLE", "PRODUCTION", "PAUSED", 1),
      group("APPLE", "PRODUCTION", "EXPIRED", 7),
      group("APPLE", "PRODUCTION", "REVOKED", 1),
      group("APPLE", "SANDBOX", "ACTIVE", 3),
      group("GOOGLE", "SANDBOX", "EXPIRED", 4),
    ]);

    expect(summary.granting).toBe(18);
    expect(summary.heldNotGranting).toBe(3);
    expect(summary.over).toBe(8);
    expect(summary.sandbox).toBe(7);
  });

  it("orders the rows: production first, then store, then state from live to over, then plan", async () => {
    const { summarizeSubscriptionGroups } = await import("@/lib/admin/subscriptions-shared");

    const { rows } = summarizeSubscriptionGroups([
      group("GOOGLE", "SANDBOX", "ACTIVE", 1),
      group("GOOGLE", "PRODUCTION", "EXPIRED", 1),
      group("APPLE", "PRODUCTION", "EXPIRED", 1),
      group("APPLE", "PRODUCTION", "ACTIVE", 1, "plus"),
      group("APPLE", "PRODUCTION", "ACTIVE", 1, "max"),
      group("GOOGLE", "PRODUCTION", "GRACE", 1),
    ]);

    expect(rows.map((row) => `${row.environment}/${row.store}/${row.state}/${row.planKey}`)).toEqual([
      "PRODUCTION/APPLE/ACTIVE/max",
      "PRODUCTION/APPLE/ACTIVE/plus",
      "PRODUCTION/APPLE/EXPIRED/plus",
      "PRODUCTION/GOOGLE/GRACE/plus",
      "PRODUCTION/GOOGLE/EXPIRED/plus",
      "SANDBOX/GOOGLE/ACTIVE/plus",
    ]);
  });

  it("is all zeros with no subscriptions, and ignores a count that is not a whole number above 0", async () => {
    const { summarizeSubscriptionGroups } = await import("@/lib/admin/subscriptions-shared");

    expect(summarizeSubscriptionGroups([])).toEqual({
      granting: 0,
      heldNotGranting: 0,
      over: 0,
      sandbox: 0,
      rows: [],
    });
    const summary = summarizeSubscriptionGroups([
      group("APPLE", "PRODUCTION", "ACTIVE", 0),
      group("APPLE", "PRODUCTION", "ACTIVE", -2),
      group("APPLE", "PRODUCTION", "ACTIVE", Number.NaN),
    ]);
    expect(summary.granting).toBe(0);
    expect(summary.rows).toEqual([]);
  });

  it("counts a state it does not know as held, not as granting", async () => {
    const { summarizeSubscriptionGroups } = await import("@/lib/admin/subscriptions-shared");

    const summary = summarizeSubscriptionGroups([group("APPLE", "PRODUCTION", "SOMETHING_NEW", 2)]);
    expect(summary.granting).toBe(0);
    expect(summary.heldNotGranting).toBe(2);
  });
});

describe("resolveUserBanner for the subscription check", () => {
  const none = { mutation: null, error: null, message: null, revokedSessions: null, userStatus: null };

  it("confirms a check that went through", async () => {
    const { resolveUserBanner } = await import("@/app/users/user-banner");

    expect(resolveUserBanner({ ...none, mutation: "subscriptions_checked" })).toEqual({
      tone: "success",
      message:
        "Asked the store about the subscriptions that can still change. What is stored now is below.",
    });
  });

  it("says a check failed, with the server's reason when there is one", async () => {
    const { resolveUserBanner } = await import("@/app/users/user-banner");

    expect(resolveUserBanner({ ...none, error: "subscriptions_check_failed" })).toEqual({
      tone: "error",
      message: "The store could not be asked.",
    });
    expect(
      resolveUserBanner({
        ...none,
        error: "subscriptions_check_failed",
        message: "Billing is not configured for this store",
      }),
    ).toEqual({
      tone: "error",
      message: "The store could not be asked. Billing is not configured for this store",
    });
    // The server's own words for an outage are the same sentence: said once.
    expect(
      resolveUserBanner({
        ...none,
        error: "subscriptions_check_failed",
        message: "The store could not be asked",
      }),
    ).toEqual({ tone: "error", message: "The store could not be asked." });
  });
});
