"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCount } from "@/lib/format/number";
import { formatMetricsDay, summarizeDailySeries, type DailyPoint } from "@/features/metrics/model";

const AVERAGE_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

// Up to a month of bars keeps a gap between them; 90 bars at phone width
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

  return `${formatCount(summary.total)} total${missing}`;
}

/**
 * One metric per UTC day, oldest on the left (shadcn chart on recharts). The
 * figures stay in text around it: the caption's total or average, the
 * scale's top, the first and last day. Hovering or arrowing through the bars
 * shows a day's value; the page's daily table holds the same numbers. A null
 * day draws no bar, and its tooltip says "no data". `scaleMax` puts charts
 * that are compared with each other on one scale.
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
  const first = series.at(0);
  const last = series.at(-1);
  const config = { value: { label, color: "var(--primary)" } } satisfies ChartConfig;
  const data = series.map((point) => ({ day: formatMetricsDay(point.date), value: point.value }));

  return (
    <figure className="flex min-w-0 flex-col gap-1">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{summaryText(series, aggregate)}</span>
      </figcaption>
      <span className="text-[11px] tabular-nums text-muted-foreground" aria-hidden>
        {max > 0 ? formatCount(max) : " "}
      </span>
      {/* The top hairline marks `max`, the domain's top. */}
      <ChartContainer config={config} className="aspect-auto h-24 w-full border-t">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barCategoryGap={series.length <= GAPPED_MAX_BARS ? 1 : 0}
        >
          <XAxis dataKey="day" hide />
          <YAxis hide domain={[0, max > 0 ? max : 1]} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {typeof value === "number" ? formatCount(value) : "no data"}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="value"
            name={label}
            fill="var(--color-value)"
            fillOpacity={0.7}
            activeBar={{ fillOpacity: 1 }}
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
            minPointSize={(value) => (value ? 2 : 0)}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
      {first && last ? (
        <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden>
          <span>{formatMetricsDay(first.date)}</span>
          <span>{formatMetricsDay(last.date)}</span>
        </div>
      ) : null}
    </figure>
  );
}
