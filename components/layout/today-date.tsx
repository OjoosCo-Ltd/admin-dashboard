"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { format } from "date-fns";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Today in the viewer's timezone. The server snapshot is empty so the server
 * render (in the server's timezone) can't disagree with the client's.
 */
export function TodayDate({ className }: { className?: string }) {
  const today = useSyncExternalStore(
    subscribe,
    () => format(new Date(), "MMM d, yyyy"),
    () => null,
  );

  return (
    <p className={cn("items-center gap-3.5 text-[15px] text-subtle-foreground", className)}>
      <CalendarBlankIcon aria-hidden className="size-4" />
      <time className="min-w-[5.5rem]">{today}</time>
    </p>
  );
}
