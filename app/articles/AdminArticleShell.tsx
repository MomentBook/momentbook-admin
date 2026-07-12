import type { ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { AdminSidebar } from "@/app/_workspace/AdminSidebar";
import type { AdminSession } from "@/lib/admin/session";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";

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
  return (
    <AppShell
      height="fill"
      mobileNav={{ breakpoint: "md" }}
      sideNav={
        <AdminSidebar
          activeTab="articles"
          eyebrow="Editorial Admin"
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
              tab: "articles",
              href: buildAdminArticleWorkspaceHref(),
              label: "Articles",
            },
          ]}
          session={session}
          title="MomentBook"
        />
      }
    >
      {children}
    </AppShell>
  );
}
