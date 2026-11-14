import type { AdminUserDeletionDto } from "@/src/apis/types";
import { deletionReasonLabel } from "@/lib/admin/users-shared";
import { DateValue, Field, Section } from "./UserDetailParts";

/** Shown only while the account is scheduled for deletion. Read-only: an
 * operator neither deletes nor restores an account on its owner's behalf. */
export function UserDeletionSection({ deletion }: { deletion: AdminUserDeletionDto }) {
  return (
    <Section title="Deletion scheduled" total={null}>
      <div className="flex flex-col gap-3">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Requested">
            <DateValue value={deletion.requestedAt} withTime />
          </Field>
          <Field label="Deletes on">
            <DateValue value={deletion.scheduledAt} withTime />
          </Field>
          <Field label="Reason">{deletionReasonLabel(deletion.reasonCode)}</Field>
        </dl>
        <p className="text-xs text-muted-foreground">
          The person can restore the account by signing in before that date. Banning the account
          cancels the deletion.
        </p>
      </div>
    </Section>
  );
}
