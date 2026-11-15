import Link from "next/link";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type FilterChip = {
  label: string;
  /** The filter's value, shown in monospace (an id). */
  value?: string;
  /** The same list without this filter. */
  clearHref: string;
};

/** The filters a list was opened with that have no control of their own
 * (an id from another page), each with a link that drops it, and one that
 * drops them all. */
export function FilterChips({ chips, clearAllHref }: { chips: FilterChip[]; clearAllHref?: string }) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      {chips.map((chip) => (
        <Badge key={chip.label} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          {chip.value ? (
            <>
              : <span className="font-mono">{chip.value}</span>
            </>
          ) : null}
          <Link
            href={chip.clearHref}
            aria-label={`Clear the ${chip.label.toLowerCase()} filter`}
            className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
          >
            <XIcon className="size-3" />
          </Link>
        </Badge>
      ))}
      {clearAllHref ? (
        <Button asChild variant="outline" size="sm">
          <Link href={clearAllHref}>Clear filters</Link>
        </Button>
      ) : null}
    </div>
  );
}
