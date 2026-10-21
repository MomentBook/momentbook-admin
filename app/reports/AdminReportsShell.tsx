import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShell } from "@/components/layout/admin-shell";
import type { AdminSession } from "@/lib/admin/session";

type AdminReportsShellProps = {
  children: ReactNode;
  openReports?: number;
  pendingReviews?: number;
  session: AdminSession;
};

export function AdminReportsShell({
  children,
  openReports,
  pendingReviews,
  session,
}: AdminReportsShellProps) {
  const sidebar = (
    <AdminSidebar
      active="reports"
      badges={{ reviews: pendingReviews ?? null, reports: openReports ?? null }}
      session={session}
    />
  );

  return <AdminShell sidebar={sidebar}>{children}</AdminShell>;
}
