import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalizedDate } from "@/components/LocalizedTime";
import { cn } from "@/lib/utils";
import { buildAdminUserHref, buildAdminUsersHref } from "@/lib/admin/paths";
import type { AdminUsersWorkspaceData } from "@/lib/admin/users";
import { USER_STATUS_LABELS, userStatusBadgeVariant } from "@/lib/admin/users-shared";
import { defaultLanguage } from "@/lib/i18n/config";
import type { AdminUserRole, AdminUserStatus } from "@/src/apis/types";

const ADMIN_DISPLAY_LANGUAGE = defaultLanguage;

type UsersFilters = {
  q?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
};

const STATUS_CHIPS: ReadonlyArray<{ label: string; status?: AdminUserStatus }> = [
  { label: "All" },
  { label: "Active", status: "ACTIVE" },
  { label: "Inactive", status: "INACTIVE" },
  { label: "Banned", status: "BANNED" },
  { label: "Deleted", status: "DELETED" },
];

function hrefFor(filters: UsersFilters, page?: number): string {
  return buildAdminUsersHref({
    q: filters.q,
    status: filters.status?.toLowerCase(),
    role: filters.role?.toLowerCase(),
    page,
  });
}

function chipClass(active: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-sm",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

function Filters({ filters }: { filters: UsersFilters }) {
  return (
    <div className="flex flex-col gap-3">
      <form method="get" action={buildAdminUsersHref()} className="flex gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder="Search name or email"
          aria-label="Search users"
          maxLength={200}
          className="max-w-sm"
        />
        {filters.status ? (
          <input type="hidden" name="status" value={filters.status.toLowerCase()} />
        ) : null}
        {filters.role ? <input type="hidden" name="role" value="admin" /> : null}
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <nav aria-label="User filters" className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const active = chip.status === filters.status;

          return (
            <Link
              key={chip.label}
              href={hrefFor({ ...filters, status: chip.status })}
              aria-current={active ? "page" : undefined}
              className={chipClass(active)}
            >
              {chip.label}
            </Link>
          );
        })}
        <Link
          href={hrefFor({ ...filters, role: filters.role ? undefined : "ADMIN" })}
          aria-pressed={filters.role === "ADMIN"}
          className={chipClass(filters.role === "ADMIN")}
        >
          Admins
        </Link>
      </nav>
    </div>
  );
}

function Pagination({ data, filters }: { data: AdminUsersWorkspaceData; filters: UsersFilters }) {
  if (data.pages <= 1) {
    return null;
  }

  const previous = data.page > 1 ? Math.min(data.page - 1, data.pages) : null;
  const next = data.page < data.pages ? data.page + 1 : null;

  return (
    <div className="flex items-center justify-between gap-2">
      {previous ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(filters, previous)}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-xs text-muted-foreground">
        Page {data.page} of {data.pages}
      </span>
      {next ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(filters, next)}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}

function EmptyState({
  data,
  filters,
}: {
  data: AdminUsersWorkspaceData;
  filters: UsersFilters;
}) {
  const filtered = Boolean(filters.q || filters.status || filters.role);

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium">
          {filtered ? "No users match these filters." : "No users yet."}
        </p>
        {filtered ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildAdminUsersHref()}>Clear filters</Link>
          </Button>
        ) : null}
        {!filtered && data.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildAdminUsersHref()}>Go to page 1</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminUsersListPageView({
  data,
  filters,
  searchIgnored,
  notFound,
}: {
  data: AdminUsersWorkspaceData;
  filters: UsersFilters;
  searchIgnored: boolean;
  notFound: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} {data.total === 1 ? "user" : "users"}
        </p>
      </div>

      {notFound ? (
        <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm">
          That user no longer exists.
        </p>
      ) : null}
      {searchIgnored ? (
        <p className="text-sm text-muted-foreground">
          Search needs 2 to 200 characters, so it was ignored.
        </p>
      ) : null}

      <Filters filters={filters} />

      {data.users.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Link
                        href={buildAdminUserHref(user.userId)}
                        className="font-medium text-primary hover:underline"
                      >
                        {user.name || "Unnamed user"}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">{user.userId}</div>
                    </TableCell>
                    <TableCell>
                      <div>{user.email ?? <span className="text-muted-foreground">—</span>}</div>
                      {user.providerEmail && user.providerEmail !== user.email ? (
                        <div className="text-xs text-muted-foreground">{user.providerEmail}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={userStatusBadgeVariant(user.status)}>
                        {USER_STATUS_LABELS[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.provider ? (
                        <span className="capitalize">{user.provider.toLowerCase()}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? <Badge>Admin</Badge> : <span>User</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user.publishedJourneyCount}
                    </TableCell>
                    <TableCell>
                      <LocalizedDate
                        lang={ADMIN_DISPLAY_LANGUAGE}
                        timestamp={Date.parse(user.createdAt)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination data={data} filters={filters} />
        </>
      ) : (
        <EmptyState data={data} filters={filters} />
      )}
    </div>
  );
}
