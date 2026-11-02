import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PUSH_PERMISSIONS,
  compareRetention,
  formatLift,
  formatRate,
  permissionMatrix,
  totalSkipped,
} from "@/lib/admin/metrics-shared";
import type {
  AdminNotificationCategoryMetricsDto,
  AdminNotificationMetricsDataDto,
  AdminNotificationRetentionDto,
} from "@/src/apis/types";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const count = (value: number) => COUNT_FORMATTER.format(value);

const PLATFORM_LABELS = { IOS: "iOS", ANDROID: "Android", UNKNOWN: "Unknown" } as const;
const PERMISSION_LABELS = {
  GRANTED: "Granted",
  PROVISIONAL: "Provisional",
  DENIED: "Denied",
  UNDETERMINED: "Not asked",
} as const;

/** The reasons a row shows inline; the rest are summed into "other". */
const INLINE_SKIP_REASONS = 3;

function SkipReasons({ category }: { category: AdminNotificationCategoryMetricsDto }) {
  if (category.skipped.length === 0) return <span className="text-muted-foreground">0</span>;

  const shown = category.skipped.slice(0, INLINE_SKIP_REASONS);
  const others = totalSkipped(category.skipped.slice(INLINE_SKIP_REASONS));
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span>{count(totalSkipped(category.skipped))}</span>
      <span className="text-xs text-muted-foreground">
        {shown.map((entry) => `${entry.reason} ${count(entry.jobs)}`).join(" · ")}
        {others > 0 ? ` · other ${count(others)}` : null}
      </span>
    </div>
  );
}

function CategoriesCard({ data }: { data: AdminNotificationMetricsDataDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By category</CardTitle>
        <CardDescription>
          Pushes per device over the window (push records are kept 30 days); opt-ins and
          opt-outs are explicit choices of active accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Delivered</TableHead>
              <TableHead className="text-right">Opened</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Skipped</TableHead>
              <TableHead className="text-right">Opted in</TableHead>
              <TableHead className="text-right">Opted out (in window)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.categories.map((category) => (
              <TableRow key={category.category}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs">{category.category}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.legalClass === "ENGAGEMENT" ? "Engagement" : "Service"}
                      {category.defaultEnabled ? " · on by default" : " · off by default"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{count(category.sent)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {count(category.delivered)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {count(category.opened)}
                  <span className="block text-xs text-muted-foreground">
                    {formatRate(category.opened, category.sent)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{count(category.failed)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <SkipReasons category={category} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{count(category.optedIn)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {count(category.optedOut)} ({count(category.optedOutInWindow)})
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PermissionsCard({ data }: { data: AdminNotificationMetricsDataDto }) {
  const rows = permissionMatrix(data.permissions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification permission</CardTitle>
        <CardDescription>Devices of active accounts, now</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No registered devices.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                {PUSH_PERMISSIONS.map((permission) => (
                  <TableHead key={permission} className="text-right">
                    {PERMISSION_LABELS[permission]}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.platform}>
                  <TableCell>{PLATFORM_LABELS[row.platform]}</TableCell>
                  {PUSH_PERMISSIONS.map((permission) => (
                    <TableCell key={permission} className="text-right tabular-nums">
                      {count(row.counts[permission])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular-nums">{count(row.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ReturnCell({ returned, eligible }: { returned: number; eligible: number }) {
  return (
    <TableCell className="text-right tabular-nums">
      {formatRate(returned, eligible)}
      <span className="block text-xs text-muted-foreground">
        {count(returned)} of {count(eligible)}
      </span>
    </TableCell>
  );
}

function CohortRow({ label, row }: { label: string; row: AdminNotificationRetentionDto }) {
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell className="text-right tabular-nums">{count(row.accounts)}</TableCell>
      <ReturnCell returned={row.d7Returned} eligible={row.d7Eligible} />
      <ReturnCell returned={row.d30Returned} eligible={row.d30Eligible} />
    </TableRow>
  );
}

function RetentionCard({ data }: { data: AdminNotificationMetricsDataDto }) {
  const engagement = data.categories.filter((category) => category.legalClass === "ENGAGEMENT");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engagement holdout</CardTitle>
        <CardDescription>
          Came back within 7 or 30 days of the first notice, counted once those days are
          over. Widen an audience only when the target beats the holdout at 30 days and
          opt-outs outside messages do not rise.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {engagement.map((category) => {
          const comparison = compareRetention(data.retention, category.category);
          return (
            <div key={category.category} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-mono text-xs">{category.category}</h3>
                <p className="text-xs text-muted-foreground">
                  Target − holdout: 7 days {formatLift(comparison.d7Lift)} · 30 days{" "}
                  {formatLift(comparison.d30Lift)}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead className="text-right">Accounts</TableHead>
                    <TableHead className="text-right">Back in 7 days</TableHead>
                    <TableHead className="text-right">Back in 30 days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <CohortRow label="Target" row={comparison.target} />
                  <CohortRow label="Holdout (1 in 10)" row={comparison.holdout} />
                </TableBody>
              </Table>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** The notification platform's figures (ADR-0096). A failed load shows one line, and
 * the rest of the page stays. */
export function NotificationMetricsSection({
  data,
}: {
  data: AdminNotificationMetricsDataDto | null;
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="notifications">
      <h2 id="notifications" className="text-sm font-medium text-muted-foreground">
        Notifications
      </h2>
      {data === null ? (
        <p className="text-xs text-muted-foreground">Could not load notification metrics.</p>
      ) : (
        <>
          <CategoriesCard data={data} />
          <div className="grid gap-3 xl:grid-cols-2">
            <RetentionCard data={data} />
            <PermissionsCard data={data} />
          </div>
        </>
      )}
    </section>
  );
}
