import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCount } from "@/lib/format/number";
import { cn } from "@/lib/utils";

export type FilterTabItem = {
  label: string;
  href: string;
  active: boolean;
  count?: number;
};

const ITEM_CLASSES = {
  line: {
    base: "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm",
    active: "border-primary font-medium text-foreground",
    idle: "border-transparent text-muted-foreground hover:text-foreground",
  },
  pill: {
    base: "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
    active: "border-primary bg-primary text-primary-foreground",
    idle: "text-muted-foreground hover:text-foreground",
  },
} as const;

/** Filters as links: each choice is a URL, so the server renders its rows
 * and the choice survives a reload or a shared link. `line` underlines the
 * current tab (a list's main split); `pill` is a row of chips. */
export function FilterTabs({
  label,
  items,
  variant = "line",
}: {
  label: string;
  items: FilterTabItem[];
  variant?: keyof typeof ITEM_CLASSES;
}) {
  const classes = ITEM_CLASSES[variant];

  return (
    <nav
      aria-label={label}
      className={cn("flex flex-wrap", variant === "line" ? "gap-1 border-b" : "gap-2")}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(classes.base, item.active ? classes.active : classes.idle)}
        >
          {item.label}
          {item.count === undefined ? null : (
            <Badge
              variant={item.active && variant === "line" ? "default" : "outline"}
              className={cn("tabular-nums", item.active && variant === "pill" && "border-current text-current")}
            >
              {formatCount(item.count)}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
}
