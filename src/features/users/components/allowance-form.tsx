import { ConfirmActionForm } from "@/components/confirm-action-form";
import { ReasonField } from "@/components/reason-field";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateAdminUserStorageAllowanceAction } from "@/features/users/actions";

/** The reason every allowance change needs; the action refuses one longer. */
const REASON_MAX_LENGTH = 500;

/**
 * "Set allowance" and, when the account has its own, "Use the plan's
 * allowance". Both sit behind a confirmation and need a reason; only "Set"
 * asks for an amount. The action checks every field again.
 */
export function AllowanceForm({
  userId,
  returnTo,
  label,
  planKey,
  hasOverride,
  disabled,
}: {
  userId: string;
  returnTo: string;
  /** How the account is named in the dialogs. */
  label: string;
  planKey: string;
  hasOverride: boolean;
  disabled: boolean;
}) {
  const fields = { userId, returnTo };

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmActionForm
        action={updateAdminUserStorageAllowanceAction}
        fields={{ ...fields, intent: "set" }}
        triggerLabel="Set allowance"
        disabled={disabled}
        title={`Set the backup allowance of ${label}?`}
        description={`Gives ${label} (${userId}) their own allowance instead of the plan's. A smaller allowance than the account uses deletes nothing: its next backups are refused until it is back under.`}
        confirmLabel="Set allowance"
      >
        <Field className="gap-1.5">
          <FieldLabel htmlFor="user-allowance-amount">Allowance (GB)</FieldLabel>
          <Input
            id="user-allowance-amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={0}
            max={1024}
            step="any"
            required
            aria-describedby="user-allowance-amount-hint"
          />
          <FieldDescription id="user-allowance-amount-hint" className="text-xs">
            From 0 to 1024 GB; decimals are fine. 0 stops new backups for this account.
          </FieldDescription>
        </Field>
        <ReasonField id="user-allowance-reason" required maxLength={REASON_MAX_LENGTH} />
      </ConfirmActionForm>
      {hasOverride ? (
        <ConfirmActionForm
          action={updateAdminUserStorageAllowanceAction}
          fields={{ ...fields, intent: "plan" }}
          triggerLabel="Use the plan's allowance"
          disabled={disabled}
          title={`Use the plan's allowance for ${label}?`}
          description={`Removes the allowance set for ${label} (${userId}); the plan (${planKey}) decides again.`}
          confirmLabel="Use the plan's allowance"
        >
          <ReasonField id="user-allowance-plan-reason" required maxLength={REASON_MAX_LENGTH} />
        </ConfirmActionForm>
      ) : null}
    </div>
  );
}
