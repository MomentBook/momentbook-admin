import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

/** What a status means for the operator; each entity's model maps its states
 * to one. */
export type StatusTone = "neutral" | "success" | "warning" | "danger";

const TONE_VARIANT = {
  neutral: "outline",
  success: "default",
  warning: "secondary",
  danger: "destructive",
} as const satisfies Record<StatusTone, string>;

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge variant={TONE_VARIANT[tone]} className={className}>
      {children}
    </Badge>
  );
}
