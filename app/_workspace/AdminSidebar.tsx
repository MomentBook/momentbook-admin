import type { ReactNode } from "react";
import { SideNav, SideNavItem, SideNavHeading } from "@astryxdesign/core/SideNav";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { logoutAdminAction } from "@/app/_workspace/actions";
import type { AdminWorkspaceTab } from "@/lib/admin/paths";
import type { AdminSession } from "@/lib/admin/session";

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
    <SideNav
      header={
        <SideNavHeading
          heading={String(title)}
          superheading={eyebrow}
        />
      }
      footer={
        <VStack gap={2} padding={1}>
          <VStack gap={0.5}>
            <Text type="label" size="2xs" color="secondary">
              Account
            </Text>
            <Text type="body" size="sm">
              {session.email || session.name || "Admin"}
            </Text>
          </VStack>

          <form action={logoutAdminAction}>
            <Button
              type="submit"
              variant="ghost"
              label="Sign out"
              size="sm"
            />
          </form>
        </VStack>
      }
    >
      {navigationItems.map((item) => (
        <SideNavItem
          key={item.tab}
          href={item.href}
          label={item.label}
          isSelected={activeTab === item.tab}
          endContent={
            item.badge ? (
              <Badge label={item.badge} variant="neutral" />
            ) : undefined
          }
        />
      ))}
    </SideNav>
  );
}
