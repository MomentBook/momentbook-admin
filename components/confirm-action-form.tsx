"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ButtonVariant = "default" | "destructive" | "outline";

function ConfirmSubmitButton({
  label,
  variant,
  onSettled,
}: {
  label: string;
  variant: ButtonVariant;
  onSettled: () => void;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  // A redirect back to the same page keeps this component mounted, so close
  // the dialog once the action has finished instead of leaving it open.
  useEffect(() => {
    if (wasPending.current && !pending) {
      onSettled();
    }
    wasPending.current = pending;
  }, [pending, onSettled]);

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Working…" : label}
    </Button>
  );
}

/**
 * A server-action form behind a confirmation dialog, for the irreversible or
 * outward-facing actions only (ban, unban, approve without translation,
 * delete article). The form and its hidden fields live inside the dialog,
 * so nothing is submitted until the admin confirms.
 */
export function ConfirmActionForm({
  action,
  fields,
  triggerLabel,
  triggerVariant = "outline",
  disabled = false,
  title,
  description,
  confirmLabel,
  children,
}: {
  action: (formData: FormData) => Promise<never>;
  fields: Record<string, string>;
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  disabled?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Extra inputs shown inside the dialog form. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="sm" disabled={disabled}>
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={action} className="grid gap-4">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children}
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <ConfirmSubmitButton
              label={confirmLabel}
              variant={triggerVariant === "destructive" ? "destructive" : "default"}
              onSettled={() => setOpen(false)}
            />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
