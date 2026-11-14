import { ConfirmActionForm } from "@/components/confirm-action-form";
import { Badge } from "@/components/ui/badge";
import {
  periodEndLabel,
  periodLabel,
  storeLabel,
  subscriptionStateLabel,
  subscriptionStateTone,
  type SubscriptionStateTone,
} from "@/lib/admin/subscriptions-shared";
import type {
  AdminStoreNotificationDto,
  AdminSubscriptionDto,
  AdminUserSubscriptionsDataDto,
} from "@/src/apis/types";
import { resyncAdminUserSubscriptionsAction } from "../subscription-actions";
import { DateValue, Field, Section } from "./UserDetailParts";

const TONE_BADGE_VARIANT: Record<SubscriptionStateTone, "secondary" | "outline"> = {
  ok: "secondary",
  attention: "outline",
  over: "outline",
};

function Subscription({ subscription }: { subscription: AdminSubscriptionDto }) {
  const tone = subscriptionStateTone(subscription.state);

  return (
    <li className="flex flex-col gap-3 border-t pt-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm">{subscription.planKey}</span>
        <Badge
          variant={TONE_BADGE_VARIANT[tone]}
          className={tone === "over" ? "text-muted-foreground" : undefined}
        >
          {subscriptionStateLabel(subscription.state)}
        </Badge>
        {subscription.grantsStorage ? null : (
          <span className="text-xs text-muted-foreground">does not raise the allowance</span>
        )}
        {subscription.environment === "SANDBOX" ? (
          <Badge variant="outline">Test purchase</Badge>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Store">{storeLabel(subscription.store)}</Field>
        <Field label="Period">{periodLabel(subscription.period)}</Field>
        <Field label={periodEndLabel(subscription)}>
          <DateValue value={subscription.currentPeriodEndAt} withTime />
        </Field>
        <Field label="Last confirmed by the store">
          <DateValue value={subscription.lastVerifiedAt} withTime />
        </Field>
        <Field label="First seen">
          <DateValue value={subscription.createdAt} withTime />
        </Field>
        <Field label="Store reference">
          {subscription.storeReference ? (
            <span className="break-all font-mono text-xs">{subscription.storeReference}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Not shown</span>
          )}
        </Field>
      </dl>
    </li>
  );
}

function Notification({ notification }: { notification: AdminStoreNotificationDto }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
      <span>
        <span className="font-mono text-xs">
          {notification.subtype
            ? `${notification.type} · ${notification.subtype}`
            : notification.type}
        </span>{" "}
        <span className="text-xs text-muted-foreground">
          {storeLabel(notification.store)}
          {notification.outcome ? `, ${notification.outcome}` : ", not processed yet"}
        </span>
      </span>
      <span className="text-xs text-muted-foreground">
        <DateValue value={notification.receivedAt} withTime />
      </span>
    </li>
  );
}

/**
 * The account's storage subscriptions as the server stores them, the store
 * notifications about them, and "Check with the store", which has the server
 * read them back from their stores. Read-only otherwise: an operator cannot
 * grant, extend, cancel or refund a subscription here; the stores do that.
 */
export function UserSubscriptionSection({
  data,
  userId,
  returnTo,
  label,
}: {
  /** `null` when the section could not be loaded. */
  data: AdminUserSubscriptionsDataDto | null;
  userId: string;
  returnTo: string;
  /** How the account is named in the dialog. */
  label: string;
}) {
  if (data === null) {
    return (
      <Section title="Storage subscription" total={null}>
        <p className="text-xs text-muted-foreground">Could not load the subscriptions.</p>
      </Section>
    );
  }

  const { subscriptions, notifications } = data;

  return (
    <Section title="Storage subscription" total={null}>
      <div className="flex flex-col gap-4">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscription.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {subscriptions.map((subscription) => (
              <Subscription key={subscription.id} subscription={subscription} />
            ))}
          </ul>
        )}

        {subscriptions.length > 0 ? (
          <div className="flex flex-col items-start gap-1.5">
            <ConfirmActionForm
              action={resyncAdminUserSubscriptionsAction}
              fields={{ userId, returnTo }}
              triggerLabel="Check with the store"
              title={`Check the subscriptions of ${label} with the store?`}
              description={`Reads the subscriptions of ${label} (${userId}) back from their stores and stores what the stores say now. It changes nothing a store did not say, and is not written to the audit log.`}
              confirmLabel="Check with the store"
            />
            <p className="text-xs text-muted-foreground">
              Subscriptions are changed, cancelled and refunded in the stores, never here.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">Recent store notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">None.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {notifications.map((notification, index) => (
                <Notification
                  key={`${notification.receivedAt}-${notification.type}-${index}`}
                  notification={notification}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}
