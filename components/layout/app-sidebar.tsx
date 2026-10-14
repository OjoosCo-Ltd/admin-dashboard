"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_SECTIONS } from "@/constants/navigation";

// Full-bleed rows as in the dashboard Figma: 44px tall, the active one teal
// with a light stripe on its left edge. Icons keep their exported sizes inside
// a 24px slot, so every label starts at the same x.
const itemClass =
  "h-11 gap-2.25 rounded-none px-5.5 text-base font-normal [&_svg]:size-auto data-active:bg-sidebar-primary data-active:font-normal data-active:text-sidebar-primary-foreground data-active:shadow-[inset_2px_0_0_var(--sidebar-primary-foreground)] data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  // The mobile sheet stays open after a link is followed unless it's closed here.
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="gap-0 px-5.5 pt-10 pb-10">
        <Link
          href="/dashboard"
          onClick={closeOnMobile}
          className="w-fit rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-sidebar-ring"
        >
          <Logo className="h-10" />
        </Link>
        <p className="-mt-0.5 text-xs text-sidebar-subtle">Admin Dashboard</p>
      </SidebarHeader>
      <SidebarContent className="pb-8">
        <nav aria-label="Main">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label ?? "home"} className={cn(section.label && "mt-7")}>
              {section.label && (
                <p className="mb-1.5 px-5.5 text-[11px] leading-4 font-semibold tracking-[0.08em] text-sidebar-label uppercase">
                  {section.label}
                </p>
              )}
              <SidebarMenu className="gap-1.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} className={itemClass}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={closeOnMobile}
                        >
                          <span className="flex w-6 shrink-0 justify-center">
                            <item.icon />
                          </span>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
