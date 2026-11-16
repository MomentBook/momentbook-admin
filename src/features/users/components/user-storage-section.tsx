import { Field, Section } from "@/components/detail-parts";
import { Badge } from "@/components/ui/badge";
import type { AdminUserStorageDto } from "@/lib/api/types";
import { formatCount } from "@/lib/format/number";
import {
  allowanceTone,
  formatBytes,
  allowanceBadgeLabel,
  type AllowanceTone,
} from "@/entities/storage/model";
import { AllowanceForm } from "./allowance-form";

// The same tones as the Storage page's "Used %" column.
const TONE_BADGE_VARIANT: Record<AllowanceTone, "secondary" | "outline" | "destructive"> = {
  ok: "secondary",
  near: "outline",
  at: "destructive",
};

/** The account's backup usage and allowance, and where an operator changes
 * the allowance (`AllowanceForm`). */
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
  const hasOverride = storage.quotaOverrideBytes !== null;

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
                {allowanceBadgeLabel(storage.usedBytes, storage.quotaBytes)}
              </Badge>
            </span>
          </Field>
          <Field label="Photos">
            <span className="tabular-nums">{formatCount(storage.photoCount)}</span>
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
          <AllowanceForm
            userId={userId}
            returnTo={returnTo}
            label={label}
            planKey={storage.planKey}
            hasOverride={hasOverride}
            disabled={disabledReason !== null}
          />
          {disabledReason ? (
            <p className="text-xs text-muted-foreground">{disabledReason}</p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
