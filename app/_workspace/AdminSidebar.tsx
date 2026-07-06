import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAdminAction } from "@/app/_workspace/actions";
import type { AdminWorkspaceTab } from "@/lib/admin/paths";
import type { AdminSession } from "@/lib/admin/session";
import styles from "@/app/_workspace/workspace.module.scss";

export type AdminSidebarNavigationItem = {
  tab: AdminWorkspaceTab;
  href: string;
  label: string;
  badge?: string;
};

type AdminSidebarProps = {
  activeTab: AdminWorkspaceTab;
  navigationItems: AdminSidebarNavigationItem[];
  session: AdminSession;
  title?: ReactNode;
  eyebrow?: string;
};

export function AdminSidebar({
  activeTab,
  navigationItems,
  session,
  title = "Moderation",
  eyebrow = "MomentBook Admin",
}: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <span className={styles.brandEyebrow}>{eyebrow}</span>
        <h1 className={styles.brandTitle}>{title}</h1>
      </div>

      <nav className={styles.nav} aria-label="Workspace sections">
        {navigationItems.map((item) => (
          <Link
            key={item.tab}
            href={item.href}
            className={
              activeTab === item.tab ? styles.navItemActive : styles.navItem
            }
            aria-current={activeTab === item.tab ? "page" : undefined}
          >
            <div className={styles.navCopy}>
              <span className={styles.navLabel}>{item.label}</span>
            </div>
            {item.badge ? (
              <span className={styles.navBadge}>{item.badge}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarCard}>
        <span className={styles.sidebarLabel}>Account</span>
        <strong className={styles.sidebarValue}>
          {session.email || session.name || "Admin"}
        </strong>
      </div>

      <form action={logoutAdminAction}>
        <button type="submit" className={styles.signOutButton}>
          Sign out
        </button>
      </form>
    </aside>
  );
}
