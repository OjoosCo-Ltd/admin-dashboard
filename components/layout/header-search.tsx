"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

/** Pill search field. UI only: it doesn't search anything until there's a search endpoint. */
export function HeaderSearch() {
  return (
    <form role="search" onSubmit={(event) => event.preventDefault()} className="min-w-0 flex-1">
      <label className="flex h-9 w-full max-w-96 items-center gap-2.5 rounded-full bg-muted px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50">
        <MagnifyingGlassIcon aria-hidden className="size-5 shrink-0 text-outline" />
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          placeholder="Search profiles, matches, or transactions..."
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-[#6b7280]"
        />
      </label>
    </form>
  );
}
