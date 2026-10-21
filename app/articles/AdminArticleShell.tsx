import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShell } from "@/components/layout/admin-shell";
import type { AdminSession } from "@/lib/admin/session";

type AdminArticleShellProps = {
  children: ReactNode;
  pendingReviews?: number;
  session: AdminSession;
};

export function AdminArticleShell({
  children,
  pendingReviews,
  session,
}: AdminArticleShellProps) {
  const sidebar = (
    <AdminSidebar
      active="articles"
      badges={{ reviews: pendingReviews ?? null }}
      session={session}
    />
  );

  return <AdminShell sidebar={sidebar}>{children}</AdminShell>;
}
