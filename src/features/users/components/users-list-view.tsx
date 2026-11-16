import Link from "next/link";
import { FilterTabs } from "@/components/filter-tabs";
import { FlashBanner } from "@/components/flash-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { UrlPagination } from "@/components/url-pagination";
import type { AdminUserRole, AdminUserStatus } from "@/lib/api/types";
import { formatCount } from "@/lib/format/number";
import type { Flash } from "@/lib/navigation/flash";
import { buildAdminUserHref, buildAdminUsersHref } from "@/lib/navigation/paths";
import type { AdminUsersWorkspaceData } from "@/features/users/loader";
import { UsersTable, type UserRow } from "./users-table";

export type UsersFilters = {
  q?: string;
  status?: AdminUserStatus;
  role?: AdminUserRole;
};

const STATUS_FILTERS: ReadonlyArray<{ label: string; status?: AdminUserStatus }> = [
  { label: "All" },
  { label: "Active", status: "ACTIVE" },
  { label: "Inactive", status: "INACTIVE" },
  { label: "Banned", status: "BANNED" },
  { label: "Deleted", status: "DELETED" },
  { label: "Deletion scheduled", status: "PENDING_DELETION" },
];

/** The directory with these filters, at `page` (1 when left out). */
function hrefFor(filters: UsersFilters, page?: number): string {
  return buildAdminUsersHref({
    q: filters.q,
    status: filters.status?.toLowerCase(),
    role: filters.role?.toLowerCase(),
    page,
  });
}

function SearchForm({ filters }: { filters: UsersFilters }) {
  return (
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
  );
}

function NoUsers({ data, filters }: { data: AdminUsersWorkspaceData; filters: UsersFilters }) {
  const filtered = Boolean(filters.q || filters.status || filters.role);

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{filtered ? "No users match these filters." : "No users yet."}</EmptyTitle>
      </EmptyHeader>
      {filtered || data.page > 1 ? (
        <EmptyContent className="flex-row justify-center">
          {filtered ? (
            <Button asChild variant="outline" size="sm">
              <Link href={buildAdminUsersHref()}>Clear filters</Link>
            </Button>
          ) : null}
          {data.page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefFor(filters)}>Go to page 1</Link>
            </Button>
          ) : null}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function UsersListView({
  banner,
  data,
  filters,
  searchIgnored,
}: {
  banner: Flash | null;
  data: AdminUsersWorkspaceData;
  filters: UsersFilters;
  searchIgnored: boolean;
}) {
  const rows: UserRow[] = data.users.map((user) => ({
    ...user,
    detailHref: buildAdminUserHref(user.userId),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          {formatCount(data.total)} {data.total === 1 ? "user" : "users"}
        </p>
      </div>

      <FlashBanner flash={banner} />
      {searchIgnored ? (
        <p className="text-sm text-muted-foreground">
          Search needs 2 to 200 characters, so it was ignored.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <SearchForm filters={filters} />
        <div className="flex flex-wrap gap-2">
          <FilterTabs
            label="Account status"
            variant="pill"
            items={STATUS_FILTERS.map((filter) => ({
              label: filter.label,
              href: hrefFor({ ...filters, status: filter.status }),
              active: filter.status === filters.status,
            }))}
          />
          <FilterTabs
            label="Role"
            variant="pill"
            items={[
              {
                label: "Admins",
                // A toggle: on adds the filter, on again takes it off.
                href: hrefFor({ ...filters, role: filters.role ? undefined : "ADMIN" }),
                active: filters.role === "ADMIN",
              },
            ]}
          />
        </div>
      </div>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <UsersTable rows={rows} />
          </div>
          <UrlPagination
            page={data.page}
            pages={data.pages}
            hrefFor={(page) => hrefFor(filters, page)}
          />
        </>
      ) : (
        <NoUsers data={data} filters={filters} />
      )}
    </div>
  );
}
