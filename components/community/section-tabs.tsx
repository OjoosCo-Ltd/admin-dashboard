"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SectionTab {
  label: string;
  href: string;
}

/**
 * A row of tabs over a hairline, each tab a link to its own page: the
 * Community section's (Groups, Events, Moderation) and a group's (Overview,
 * Members…).
 */
export function SectionTabs({
  tabs,
  label,
}: {
  tabs: SectionTab[];
  /** Names the navigation for screen readers, e.g. "Community sections". */
  label: string;
}) {
  const pathname = usePathname();

  return (
    // Scrolls sideways on phones rather than wrapping.
    <nav aria-label={label} className="[scrollbar-width:none] overflow-x-auto">
      <ul className="flex w-max min-w-full border-b border-border/50 dark:border-border">
        {tabs.map((tab) => {
          const current = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "block border-b-2 px-4 pt-3 pb-3.5 text-xs/4 font-semibold tracking-wider whitespace-nowrap transition-colors outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  current
                    ? "border-action text-action dark:border-primary dark:text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
