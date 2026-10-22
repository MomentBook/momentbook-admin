import { cn } from "@/lib/utils";
import { formatMetricsDay, summarizeDailySeries, type DailyPoint } from "@/lib/admin/metrics-shared";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const AVERAGE_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

// Up to a month of bars keeps a 2px gap between them; 90 bars at phone width
// leave under 3px each, so they touch instead of losing their width to gaps.
const GAPPED_MAX_BARS = 31;

function summaryText(series: DailyPoint[], aggregate: "total" | "average"): string {
  const summary = summarizeDailySeries(series);
  const missing = summary.missingDays > 0 ? ` · no data for ${summary.missingDays} days` : "";

  if (aggregate === "average") {
    return summary.average === null
      ? "No data in this window"
      : `Avg ${AVERAGE_FORMATTER.format(summary.average)} a day${missing}`;
  }

  return `${COUNT_FORMATTER.format(summary.total)} total${missing}`;
}

/**
 * One metric per UTC day as plain div columns, oldest on the left. Each column
 * is the hover target and carries the date and value; the page's daily table
 * holds the same numbers for touch and screen-reader use. A null day draws no
 * bar and no baseline, so missing data reads as a gap rather than a zero.
 * `scaleMax` puts charts that are compared with each other on one scale.
 */
export function DailyBarChart({
  series,
  label,
  aggregate = "total",
  scaleMax = 0,
}: {
  series: DailyPoint[];
  label: string;
  aggregate?: "total" | "average";
  scaleMax?: number;
}) {
  const max = Math.max(scaleMax, summarizeDailySeries(series).max);
  const gapped = series.length <= GAPPED_MAX_BARS;
  const first = series.at(0);
  const last = series.at(-1);

  return (
    <figure className="flex min-w-0 flex-col gap-1">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{summaryText(series, aggregate)}</span>
      </figcaption>
      <span className="text-[11px] tabular-nums text-muted-foreground" aria-hidden>
        {max > 0 ? COUNT_FORMATTER.format(max) : " "}
      </span>
      {/* The top hairline marks `max`; bar heights are percentages of it. */}
      <div role="group" aria-label={label} className="flex h-24 border-t border-border">
        {series.map((point) => {
          const text = `${formatMetricsDay(point.date)}: ${
            point.value === null ? "no data" : COUNT_FORMATTER.format(point.value)
          }`;
          const height = point.value && max > 0 ? (point.value / max) * 100 : 0;

          return (
            <div
              key={point.date}
              role="img"
              aria-label={text}
              title={text}
              className={cn(
                "group flex h-full min-w-0 flex-1 items-end justify-center",
                gapped && "px-px",
                point.value !== null && "border-b border-muted-foreground/40",
              )}
            >
              {height > 0 ? (
                // The bar's percentage height needs a definite-height parent.
                <div
                  className="w-full min-w-px max-w-6 rounded-t-[2px] bg-primary/70 group-hover:bg-primary"
                  style={{ height: `max(2px, ${height}%)` }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {first && last ? (
        <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden>
          <span>{formatMetricsDay(first.date)}</span>
          <span>{formatMetricsDay(last.date)}</span>
        </div>
      ) : null}
    </figure>
  );
}
