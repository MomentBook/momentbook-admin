"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-bold">M</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{title}</span>
                  <span className="text-xs text-muted-foreground">{eyebrow}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.tab}>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === item.tab}
                  tooltip={item.label}
                >
                  <Link href={item.href} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge ? (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Account</span>
            <span className="text-sm truncate">
              {session.email || session.name || "Admin"}
            </span>
          </div>

          <form action={logoutAdminAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
