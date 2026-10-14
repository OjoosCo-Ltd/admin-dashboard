"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAuthStore } from "@/store/use-auth-store";

/** Every client-side provider, mounted once in app/layout.tsx. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <NuqsAdapter>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </NuqsAdapter>
      </QueryProvider>
    </ThemeProvider>
  );
}
