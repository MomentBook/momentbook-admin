import { cn } from "@/lib/utils";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

/** One figure in a bordered tile. A number is shown with thousands
 * separators; a string (`1.2 GB`) as given. `alert` uses the destructive
 * text colour for a figure that needs attention. */
export function StatTile({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold", alert && "text-destructive")}>
        {typeof value === "number" ? COUNT_FORMATTER.format(value) : value}
      </span>
    </div>
  );
}
