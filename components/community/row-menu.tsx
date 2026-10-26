"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { Fragment } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { enabled, type Feature } from "@/constants/features";

export interface RowMenuItem {
  label: string;
  /** Set apart below a rule, in red. */
  destructive?: boolean;
  /** Left out while this feature is off. */
  feature?: Feature;
}

/**
 * A row's ⋮ menu. The community Figmas leave their Actions columns empty, so
 * these are stand-ins. UI only: each item says it isn't available yet.
 */
export function RowMenu({ label, items: all }: { label: string; items: RowMenuItem[] }) {
  const items = enabled(all);
  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={label}
        className="relative z-10 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
      >
        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {item.destructive && index > 0 && !items[index - 1].destructive && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              variant={item.destructive ? "destructive" : "default"}
              onSelect={() => toast(`${item.label} isn't available yet`)}
            >
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
