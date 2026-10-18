"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { SETTINGS_NAV } from "@/constants/settings-navigation";

/** The settings menu: grouped down the left on desktop, one scrolling row on smaller screens. */
export function SettingsNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const activePill = useRef<HTMLAnchorElement>(null);

  // On smaller screens the menu is one scrolling row; keep the open section in view.
  useEffect(() => {
    activePill.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="Settings" className="min-w-0">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:hidden">
        {SETTINGS_NAV.flatMap((section) => section.items).map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              ref={isActive(item.href) ? activePill : undefined}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="flex h-9 items-center rounded-full px-3.5 text-sm whitespace-nowrap text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-container aria-[current=page]:font-medium aria-[current=page]:text-action dark:aria-[current=page]:text-primary"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden flex-col gap-6 lg:flex">
        {SETTINGS_NAV.map((section) => (
          <div key={section.label}>
            <h2 className="px-3 text-[11px] leading-4 font-medium tracking-wider text-outline uppercase">
              {section.label}
            </h2>
            <ul className="mt-2 flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8.5 items-center justify-between gap-3 rounded-md px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        active
                          ? "bg-container font-medium text-action dark:bg-muted dark:text-primary"
                          : "text-foreground/85 hover:bg-muted",
                      )}
                    >
                      {item.title}
                      {active && <CaretRightIcon aria-hidden weight="bold" className="size-3" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
