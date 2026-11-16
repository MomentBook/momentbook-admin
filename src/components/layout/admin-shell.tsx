"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type AdminShellProps = {
  children: ReactNode;
  sidebar: ReactNode;
  defaultOpen?: boolean;
};

export function AdminShell({ children, sidebar, defaultOpen = true }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {sidebar}
      {/* A flex item defaults to min-width:auto, so without min-w-0 a wide table
          widens the inset and the whole page scrolls sideways instead of the
          table's own overflow-x container. */}
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            MomentBook Admin
          </span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
