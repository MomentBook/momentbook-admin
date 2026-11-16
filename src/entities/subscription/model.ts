// How a storage subscription reads on the admin pages. Pure: the user page's
// section and the Storage page's summary share it.

const STATE_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  GRACE: "Grace period",
  ON_HOLD: "On hold",
  PAUSED: "Paused",
  EXPIRED: "Expired",
  REVOKED: "Refunded or revoked",
};

/** The state as an operator reads it; one the page does not know is shown as
 * it came rather than hidden. */
export function subscriptionStateLabel(state: string): string {
  return STATE_LABELS[state] ?? state;
}

export type SubscriptionStateTone = "ok" | "attention" | "over";

const GRANTING_STATES = new Set(["ACTIVE", "GRACE"]);
const OVER_STATES = new Set(["EXPIRED", "REVOKED"]);

/** `ok` for a paid, renewing-or-running subscription; `over` once it ended;
 * `attention` for everything between (a payment being retried, a pause) and
 * for a state the page does not know. */
export function subscriptionStateTone(state: string): SubscriptionStateTone {
  if (state === "ACTIVE") return "ok";
  return OVER_STATES.has(state) ? "over" : "attention";
}

const STORE_LABELS: Record<string, string> = { APPLE: "App Store", GOOGLE: "Google Play" };

export function storeLabel(store: string): string {
  return STORE_LABELS[store] ?? store;
}

export function periodLabel(period: string | null): string {
  if (period === "MONTHLY") return "Monthly";
  if (period === "YEARLY") return "Yearly";
  return "—";
}

/** What the subscription's date means in its state: the label that goes in
 * front of `currentPeriodEndAt`. */
export function periodEndLabel(subscription: { state: string; autoRenew: boolean }): string {
  switch (subscription.state) {
    case "ACTIVE":
      return subscription.autoRenew ? "Renews" : "Cancelled, paid until";
    case "GRACE":
      return "Grace period until";
    case "ON_HOLD":
    case "PAUSED":
      return "Paid period ended";
    case "EXPIRED":
      return "Ended";
    case "REVOKED":
      // A refund or a revocation can come in the middle of a paid period:
      // the date is then still ahead, and is not when the subscription ended.
      return "Paid period was until";
    default:
      return "Period end";
  }
}

const STILL_CHANGING_STATES = new Set(["ACTIVE", "GRACE", "ON_HOLD", "PAUSED"]);

/** Whether "Check with the store" would ask anything: the server reads back
 * only the subscriptions that can still change in their store, never one
 * that has ended. */
export function canAskStoreAgain(subscriptions: ReadonlyArray<{ state: string }>): boolean {
  return subscriptions.some((subscription) => STILL_CHANGING_STATES.has(subscription.state));
}

export type SubscriptionGroup = {
  store: string;
  environment: string;
  state: string;
  planKey: string;
  count: number;
};

export type SubscriptionSummary = {
  /** Production subscriptions that raise an allowance now (active, grace). */
  granting: number;
  /** Production subscriptions a store still holds that raise nothing (on
   * hold, paused, a state the page does not know). */
  heldNotGranting: number;
  /** Production subscriptions that are over (expired, refunded or revoked). */
  over: number;
  /** Test purchases, in any state. */
  sandbox: number;
  /** The groups with a count, production first, then by store, by state from
   * live to over, by plan. */
  rows: SubscriptionGroup[];
};

const STATE_ORDER = ["ACTIVE", "GRACE", "ON_HOLD", "PAUSED", "EXPIRED", "REVOKED"];

function stateRank(state: string): number {
  const rank = STATE_ORDER.indexOf(state);
  // A state the page does not know sits between the held and the over ones.
  return rank === -1 ? 3.5 : rank;
}

function environmentRank(environment: string): number {
  return environment === "PRODUCTION" ? 0 : 1;
}

/** The Storage page's subscription figures. Test purchases are counted apart
 * and never in the three production figures. A count that is not a whole
 * number above 0 is left out. */
export function summarizeSubscriptionGroups(
  groups: readonly SubscriptionGroup[],
): SubscriptionSummary {
  const rows = groups
    .filter((group) => Number.isInteger(group.count) && group.count > 0)
    .sort(
      (a, b) =>
        environmentRank(a.environment) - environmentRank(b.environment) ||
        a.store.localeCompare(b.store) ||
        stateRank(a.state) - stateRank(b.state) ||
        a.planKey.localeCompare(b.planKey),
    );

  const summary: SubscriptionSummary = {
    granting: 0,
    heldNotGranting: 0,
    over: 0,
    sandbox: 0,
    rows,
  };

  for (const row of rows) {
    if (row.environment !== "PRODUCTION") {
      summary.sandbox += row.count;
    } else if (GRANTING_STATES.has(row.state)) {
      summary.granting += row.count;
    } else if (OVER_STATES.has(row.state)) {
      summary.over += row.count;
    } else {
      summary.heldNotGranting += row.count;
    }
  }

  return summary;
}
