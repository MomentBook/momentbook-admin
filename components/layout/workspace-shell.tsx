import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { AdminNavKey } from "@/components/layout/admin-nav";
import type { AttentionCounts } from "@/lib/admin/attention";
import type { AdminSession } from "@/lib/admin/session";

// The sidebar's own open/collapsed cookie (components/ui/sidebar.tsx).
const SIDEBAR_STATE_COOKIE = "sidebar_state";

/**
 * The one app shell for workspace pages. Rendered by each page, not a layout,
 * because layouts are not re-rendered on navigation and the counts must be
 * fresh after every mutation redirect.
 */
export async function WorkspaceShell({
  active,
  counts,
  session,
  children,
}: {
  active: AdminNavKey;
  counts: AttentionCounts;
  session: AdminSession;
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_STATE_COOKIE)?.value !== "false";

  return (
    <AdminShell
      defaultOpen={defaultOpen}
      sidebar={
        <AdminSidebar
          active={active}
          account={session.email || session.name || "Admin"}
          badges={{ reviews: counts.pendingReviews, reports: counts.openReports }}
        />
      }
    >
      {children}
    </AdminShell>
  );
}
