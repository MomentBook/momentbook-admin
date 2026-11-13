import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { buildAdminUserHref } from "@/lib/admin/paths";
import { formatRate } from "@/lib/admin/metrics-shared";
import {
  allowanceTone,
  formatBytes,
  storageBucketLabel,
  usagePercent,
  type AllowanceTone,
} from "@/lib/admin/storage-shared";
import type { AdminStorageDataDto } from "@/src/apis/types";

const COUNT_FORMATTER = new Intl.NumberFormat("en-US");
const count = (value: number) => COUNT_FORMATTER.format(value);

const TONE_BADGE_VARIANT: Record<AllowanceTone, "secondary" | "outline" | "destructive"> = {
  ok: "secondary",
  near: "outline",
  at: "destructive",
};

function StatTile({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold", alert && "text-destructive")}>{value}</span>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <h2 id={id} className="text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TableCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BucketsTable({ data }: { data: AdminStorageDataDto }) {
  return (
    <TableCard title="Accounts by backup size">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Range</TableHead>
            <TableHead className="text-right">Accounts</TableHead>
            <TableHead className="text-right">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.buckets.map((bucket, index) => (
            <TableRow key={bucket.upToBytes ?? "over"}>
              <TableCell>
                {storageBucketLabel(
                  bucket.upToBytes,
                  index === 0 ? null : data.buckets[index - 1].upToBytes,
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{count(bucket.accounts)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatRate(bucket.accounts, data.accountsWithBackups)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

function TopAccountsTable({ accounts }: { accounts: AdminStorageDataDto["topAccounts"] }) {
  return (
    <TableCard title="Largest backups">
      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No account has a backup yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Used</TableHead>
              <TableHead className="text-right">Photos</TableHead>
              <TableHead className="text-right">Allowance</TableHead>
              <TableHead className="text-right">Used %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.userId}>
                <TableCell>
                  <Link
                    href={buildAdminUserHref(account.userId)}
                    className="font-medium text-primary hover:underline"
                  >
                    {account.name || "No name"}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">{account.userId}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBytes(account.usedBytes)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{count(account.photoCount)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBytes(account.quotaBytes)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={TONE_BADGE_VARIANT[allowanceTone(account.usedBytes, account.quotaBytes)]}
                    className="tabular-nums"
                  >
                    {usagePercent(account.usedBytes, account.quotaBytes)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}

function PlansTable({ plans }: { plans: AdminStorageDataDto["plans"] }) {
  const yesOrDash = (value: boolean) => (value ? "Yes" : "—");

  return (
    <TableCard title="Plans">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Allowance</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Sold in stores</TableHead>
            <TableHead className="text-right">Accounts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.key}>
              <TableCell className="font-mono text-xs">{plan.key}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBytes(plan.quotaBytes)}
              </TableCell>
              <TableCell>{yesOrDash(plan.isDefault)}</TableCell>
              <TableCell>{yesOrDash(plan.isPurchasable)}</TableCell>
              <TableCell className="text-right tabular-nums">{count(plan.accounts)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

export function AdminStoragePageView({ data }: { data: AdminStorageDataDto }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Storage</h1>

      <Section id="summary" title="Summary">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile label="Total backups" value={formatBytes(data.totalBytes)} />
          <StatTile label="Photos" value={count(data.totalPhotos)} />
          <StatTile label="Accounts with backups" value={count(data.accountsWithBackups)} />
          <StatTile label="Published copies" value={formatBytes(data.publishedBytes)} />
        </div>
        <p className="text-xs text-muted-foreground">
          Published copies count publications with a recorded size.
        </p>
      </Section>

      <Section id="allowance" title="Allowance">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile label="At the allowance" value={count(data.atLimit)} alert={data.atLimit > 0} />
          <StatTile label="Near the allowance (80%+)" value={count(data.nearLimit)} />
        </div>
        <p className="text-xs text-muted-foreground">
          The allowance is enforced only when the API&apos;s storage mode is set to enforce; these
          accounts would be refused new backups.
        </p>
      </Section>

      <BucketsTable data={data} />
      <TopAccountsTable accounts={data.topAccounts} />
      <PlansTable plans={data.plans} />
    </div>
  );
}
