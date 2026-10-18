"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/well-being", label: "Overview" },
  { href: "/well-being/resources", label: "Resources" },
  { href: "/well-being/assessment", label: "Assessment" },
  { href: "/well-being/dating-coach", label: "Dating Coach" },
];

/** The section's tabs: each is its own route, underlined while you're anywhere inside it. */
export function WellbeingTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const current =
    TABS.slice(1).find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
      ?.href ?? "/well-being";

  return (
    <nav aria-label="Well-being sections" className={cn("-mt-1 overflow-x-auto", className)}>
      <ul className="flex min-w-max gap-6">
        {TABS.map((tab) => {
          const active = tab.href === current;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center rounded-t-md px-1 text-sm font-semibold tracking-wide outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "text-action after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:rounded-full after:bg-action dark:text-primary dark:after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
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
