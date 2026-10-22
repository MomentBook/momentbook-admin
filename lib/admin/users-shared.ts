import type { AdminUserRole, AdminUserStatus } from "@/src/apis/types";

export const ADMIN_USERS_PAGE_SIZE = 20;

// The API accepts q of 2..200 characters.
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 200;

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BANNED: "Banned",
  DELETED: "Deleted",
};

export function userStatusBadgeVariant(
  status: AdminUserStatus,
): "default" | "destructive" | "secondary" | "outline" {
  if (status === "ACTIVE") return "default";
  if (status === "BANNED") return "destructive";
  if (status === "INACTIVE") return "secondary";
  return "outline";
}

/** A search the API accepts, or `undefined` (it answers 400 otherwise). */
export function parseUserSearchQuery(raw?: string | null): string | undefined {
  const trimmed = raw?.trim();

  if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH || trimmed.length > MAX_SEARCH_LENGTH) {
    return undefined;
  }

  return trimmed;
}

/** The directory search: a usable `q`, or `ignored` when something was typed
 * that the API would reject (one character, only spaces, over 200) so the
 * page can say why the results are unfiltered. An empty `q` is no search. */
export function resolveUserSearch(raw?: string | null): { q?: string; ignored: boolean } {
  const q = parseUserSearchQuery(raw);

  return q ? { q, ignored: false } : { ignored: Boolean(raw) };
}

export function parseUserStatusFilter(raw?: string | null): AdminUserStatus | undefined {
  // Only the lowercase URL form is canonical.
  return (Object.keys(USER_STATUS_LABELS) as AdminUserStatus[]).find(
    (status) => status.toLowerCase() === raw,
  );
}

export function parseUserRoleFilter(raw?: string | null): AdminUserRole | undefined {
  return raw === "admin" ? "ADMIN" : undefined;
}
