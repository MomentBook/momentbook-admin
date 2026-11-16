import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** The reason an account or content action records in the audit log.
 * Optional unless the action cannot go without one. */
export function ReasonField({
  id,
  required = false,
  maxLength = 1000,
}: {
  id: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id}>{required ? "Reason" : "Reason (optional)"}</FieldLabel>
      <Input id={id} name="reason" maxLength={maxLength} required={required} />
      <FieldDescription className="text-xs">Saved in the audit log.</FieldDescription>
    </Field>
  );
}
