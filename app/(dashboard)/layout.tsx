import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// The Figma has no collapse control on desktop, so the sidebar always starts
// open there (shadcn's saved-state cookie would otherwise strand it closed).
// Below md it is a sheet opened from the header's menu button.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen style={{ "--sidebar-width": "17.3125rem" } as CSSProperties}>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-surface">
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
