import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Settings runs full width in the Figma, with no sidebar on desktop. The
// provider starts closed, so the off-canvas sidebar stays out of the way
// there, while on phones the header's menu button still opens it as a sheet.
export default function SettingsGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "17.3125rem" } as CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-surface">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
