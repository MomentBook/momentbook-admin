import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedDate, LocalizedDateTime } from "@/components/LocalizedTime";
import { defaultLanguage } from "@/lib/i18n/config";

// The small pieces every section of the user page is built from.

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

export function DateValue({ value, withTime = false }: { value: string | null; withTime?: boolean }) {
  const timestamp = value ? Date.parse(value) : null;

  return withTime ? (
    <LocalizedDateTime lang={ADMIN_DISPLAY_LANGUAGE} timestamp={timestamp} fallback="—" />
  ) : (
    <LocalizedDate lang={ADMIN_DISPLAY_LANGUAGE} timestamp={timestamp} fallback="—" />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** A history section; "View all" appears once there is something to see. */
export function Section({
  title,
  total,
  viewAllHref,
  children,
}: {
  title: string;
  total: number | null;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {viewAllHref && total !== null && total > 0 ? (
          <CardAction>
            <Link href={viewAllHref} className="text-xs text-primary hover:underline">
              View all {total}
            </Link>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** A reason field for an account action. Optional by default (the sign-out,
 * ban and unban notes); `required` for an action that cannot go without one. */
export function ReasonInput({
  id,
  required = false,
  maxLength = 1000,
}: {
  id: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{required ? "Reason" : "Reason (optional)"}</Label>
      <Input id={id} name="reason" maxLength={maxLength} required={required} />
      <p className="text-xs text-muted-foreground">Saved in the audit log.</p>
    </div>
  );
}
