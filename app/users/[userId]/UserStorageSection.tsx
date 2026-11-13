import { ConfirmActionForm } from "@/components/confirm-action-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  allowanceTone,
  formatBytes,
  usagePercent,
  type AllowanceTone,
} from "@/lib/admin/storage-shared";
import type { AdminUserStorageDto } from "@/src/apis/types";
import { updateAdminUserStorageAllowanceAction } from "../actions";
import { Field, ReasonInput, Section } from "./UserDetailParts";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

// The same tones as the Storage page's "Used %" column.
const TONE_BADGE_VARIANT: Record<AllowanceTone, "secondary" | "outline" | "destructive"> = {
  ok: "secondary",
  near: "outline",
  at: "destructive",
};

/** The account's backup usage and allowance, and where an operator changes
 * the allowance. Both buttons sit behind the page's confirmation dialog and
 * need a reason; only the "Set" dialog asks for an amount. */
export function UserStorageSection({
  storage,
  userId,
  returnTo,
  label,
  disabledReason,
}: {
  storage: AdminUserStorageDto;
  userId: string;
  returnTo: string;
  /** How the account is named in the dialogs. */
  label: string;
  /** Why the allowance cannot be changed, or `null`. */
  disabledReason: string | null;
}) {
  const disabled = disabledReason !== null;
  const hasOverride = storage.quotaOverrideBytes !== null;
  const fields = { userId, returnTo };

  return (
    <Section title="Backup storage" total={null}>
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Used">
            <span className="flex flex-wrap items-center gap-2">
              {formatBytes(storage.usedBytes)}
              <Badge
                variant={TONE_BADGE_VARIANT[allowanceTone(storage.usedBytes, storage.quotaBytes)]}
                className="tabular-nums"
              >
                {usagePercent(storage.usedBytes, storage.quotaBytes)}%
              </Badge>
            </span>
          </Field>
          <Field label="Photos">
            <span className="tabular-nums">{COUNT_FORMATTER.format(storage.photoCount)}</span>
          </Field>
          <Field label="Allowance">
            <span>{formatBytes(storage.quotaBytes)}</span>{" "}
            <span className="text-xs text-muted-foreground">
              {hasOverride ? (
                "set for this account"
              ) : (
                <>
                  from plan <span className="font-mono">{storage.planKey}</span>
                </>
              )}
            </span>
          </Field>
        </dl>

        <div className="flex flex-col items-start gap-1.5">
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
              <div className="grid gap-1.5">
                <Label htmlFor="user-allowance-amount">Allowance (GB)</Label>
                <Input
                  id="user-allowance-amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={1024}
                  step="any"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  From 0 to 1024 GB; decimals are fine. 0 stops new backups for this account.
                </p>
              </div>
              <ReasonInput id="user-allowance-reason" required maxLength={500} />
            </ConfirmActionForm>
            {hasOverride ? (
              <ConfirmActionForm
                action={updateAdminUserStorageAllowanceAction}
                fields={{ ...fields, intent: "plan" }}
                triggerLabel="Use the plan's allowance"
                disabled={disabled}
                title={`Use the plan's allowance for ${label}?`}
                description={`Removes the allowance set for ${label} (${userId}); the plan (${storage.planKey}) decides again.`}
                confirmLabel="Use the plan's allowance"
              >
                <ReasonInput id="user-allowance-plan-reason" required maxLength={500} />
              </ConfirmActionForm>
            ) : null}
          </div>
          {disabledReason ? (
            <p className="text-xs text-muted-foreground">{disabledReason}</p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
