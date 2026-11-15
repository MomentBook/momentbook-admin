import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Time } from "./time";

// The small pieces every detail page's sections are built from.

export function DateValue({ value, withTime = false }: { value: string | null; withTime?: boolean }) {
  return <Time value={value} withTime={withTime} fallback="—" />;
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
