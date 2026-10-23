import { BellIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { HeaderSearch } from "@/components/layout/header-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TodayDate } from "@/components/layout/today-date";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FEATURES } from "@/constants/features";

/** 80px top bar: search on the left; alerts, theme, today's date and the account on the right. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-3 border-b bg-background pr-4 pl-4 sm:pr-6 md:pl-12">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <HeaderSearch />
      <div className="ml-auto flex items-center">
        {/* Hidden until there's an admin notification feed (GET /notifications is each member's own). */}
        {FEATURES.adminNotifications && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative mr-1 size-10 rounded-full text-muted-foreground"
          >
            <Link href="/notifications" aria-label="Notifications">
              <BellIcon className="size-5.5" />
              <span className="absolute top-2 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <TodayDate className="ml-4 hidden lg:flex" />
        <span aria-hidden className="mr-5 ml-8 hidden h-8 w-px bg-border sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
