import { ConfirmActionForm } from "@/components/confirm-action-form";
import { ReasonField } from "@/components/reason-field";
import { Button } from "@/components/ui/button";
import { updateAdminUserStatusAction } from "@/entities/user/status-action";

/**
 * Ban or unban an account, always behind a confirmation; a deleted account
 * offers neither. A banned account is offered unban; any other (active,
 * inactive, pending deletion, or a status the page does not know) is
 * offered ban.
 */
export function UserStatusForm({
  user,
  returnTo,
  reportId,
  banLabel = "Ban",
  disabled = false,
}: {
  user: { id: string; label: string; status?: string | null };
  returnTo: string;
  /** The report the decision answers, recorded with the sanction. */
  reportId?: string;
  banLabel?: string;
  disabled?: boolean;
}) {
  const fields = { userId: user.id, returnTo, ...(reportId ? { reportId } : {}) };
  const reasonId = `user-status-reason-${user.id}`;

  if (user.status === "DELETED") {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Deleted account
      </Button>
    );
  }

  if (user.status === "BANNED") {
    return (
      <ConfirmActionForm
        action={updateAdminUserStatusAction}
        fields={{ ...fields, status: "active" }}
        triggerLabel="Unban"
        disabled={disabled}
        title={`Unban ${user.label}?`}
        description={`Lifts the ban on ${user.label} (${user.id}). If required consents are pending, the account stays inactive until it accepts them.`}
        confirmLabel="Unban"
      >
        <ReasonField id={reasonId} />
      </ConfirmActionForm>
    );
  }

  // The API bans an account pending deletion and the ban cancels the
  // deletion; unban does not apply to it (409).
  return (
    <ConfirmActionForm
      action={updateAdminUserStatusAction}
      fields={{ ...fields, status: "banned" }}
      triggerLabel={banLabel}
      triggerVariant="destructive"
      disabled={disabled}
      title={`Ban ${user.label}?`}
      description={`Bans ${user.label} (${user.id}). All of their sessions are revoked immediately.${
        user.status === "PENDING_DELETION" ? " The scheduled deletion is cancelled." : ""
      }`}
      confirmLabel={banLabel}
    >
      <ReasonField id={reasonId} />
    </ConfirmActionForm>
  );
}
