import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletionReasonShare } from "@/lib/admin/metrics-shared";
import { deletionReasonLabel } from "@/lib/admin/users-shared";
import type { AdminMetricsDeletionsDto } from "@/src/apis/types";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");

/** Account deletions over the selected window, and the accounts waiting for
 * their deletion date now. */
export function AccountDeletionsSection({
  deletions,
  days,
}: {
  deletions: AdminMetricsDeletionsDto;
  days: number;
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="account-deletions">
      <h2 id="account-deletions" className="text-sm font-medium text-muted-foreground">
        Account deletions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Requested" value={deletions.requested} />
        <StatTile label="Restored by owner" value={deletions.restored} />
        <StatTile label="Deleted" value={deletions.executed} />
        <StatTile label="Scheduled now" value={deletions.pending} />
      </div>
      <p className="text-xs text-muted-foreground">
        Requested, restored and deleted count the last {days} days. Scheduled now is the accounts
        waiting for their deletion date: not limited to the period.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reasons given</CardTitle>
        </CardHeader>
        <CardContent>
          {deletions.requested === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deletion was requested in this period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletions.reasons.map((row) => (
                  <TableRow key={row.reasonCode ?? "not-given"}>
                    <TableCell>{deletionReasonLabel(row.reasonCode)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {COUNT_FORMATTER.format(row.count)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {deletionReasonShare(row.count, deletions.requested)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
