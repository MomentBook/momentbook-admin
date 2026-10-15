import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminShell } from "@/components/layout/admin-shell";
import type { AdminSession } from "@/lib/admin/session";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminReportsHref,
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";

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
      activeTab="reports"
      eyebrow="Moderation Admin"
      navigationItems={[
        {
          tab: "overview",
          href: buildAdminWorkspaceHref("overview"),
          label: "Overview",
        },
        {
          tab: "reviews",
          href: buildAdminWorkspaceHref("reviews"),
          label: "Reviews",
          badge:
            typeof pendingReviews === "number" && pendingReviews > 0
              ? String(pendingReviews)
              : undefined,
        },
        {
          tab: "reports",
          href: buildAdminReportsHref(),
          label: "Reports",
          badge:
            typeof openReports === "number" && openReports > 0
              ? String(openReports)
              : undefined,
        },
        {
          tab: "articles",
          href: buildAdminArticleWorkspaceHref(),
          label: "Articles",
        },
      ]}
      session={session}
      title="MomentBook"
    />
  );

  return <AdminShell sidebar={sidebar}>{children}</AdminShell>;
}
