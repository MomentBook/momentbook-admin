import { formatCount } from "@/lib/format/number";
import { cn } from "@/lib/utils";

/** One figure in a bordered tile. A number is shown with thousands
 * separators; a string (`1.2 GB`) as given. `alert` uses the destructive
 * text colour for a figure that needs attention; `hint` says what it
 * counts. */
export function StatTile({
  label,
  value,
  alert = false,
  hint,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold", alert && "text-destructive")}>
        {typeof value === "number" ? formatCount(value) : value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
