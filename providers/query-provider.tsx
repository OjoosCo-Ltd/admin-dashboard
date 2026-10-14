"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

import { getQueryClient } from "@/libs/react-query/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Renders nothing in production builds. Top-left (over the sidebar logo)
          because the other corners hold the account menu, the dashboard's
          quick-actions button and Next's dev indicator. */}
      <ReactQueryDevtools buttonPosition="top-left" />
    </QueryClientProvider>
  );
}
