"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AdminOverviewWeek } from "@/features/overview/loader";

const config = {
  count: { label: "Published", color: "var(--primary)" },
} satisfies ChartConfig;

/** Journeys first published per UTC week, oldest on the left, each bar
 * labelled with its count. */
export function IntakeChart({ weeks }: { weeks: AdminOverviewWeek[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-36 w-full">
      <BarChart accessibilityLayer data={weeks} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          fillOpacity={0.7}
          activeBar={{ fillOpacity: 1 }}
          radius={4}
          minPointSize={2}
          isAnimationActive={false}
        >
          <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
