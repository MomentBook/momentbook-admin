import type { ReactNode } from "react";
import { AdminSidebar } from "@/app/_workspace/AdminSidebar";
import type { AdminSession } from "@/lib/admin/session";
import {
  buildAdminArticleWorkspaceHref,
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";
import workspaceStyles from "@/app/_workspace/workspace.module.scss";
import styles from "./article-admin.module.scss";

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
    <div className={workspaceStyles.page}>
      <div className={workspaceStyles.shell}>
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

        <section className={`${workspaceStyles.content} ${styles.workspaceContent}`}>
          {children}
        </section>
      </div>
    </div>
  );
}
