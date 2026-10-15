"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/** Light/dark switch. Both icons render and CSS picks one, so the server render matches. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn("size-10 rounded-full text-muted-foreground", className)}
    >
      <MoonIcon className="size-5.5 dark:hidden" />
      <SunIcon className="hidden size-5.5 dark:block" />
    </Button>
  );
}
