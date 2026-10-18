"use client";

import { ArrowRightIcon, ChatsIcon, TrendUpIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { TopDiscussion } from "@/types/community";

/** The group's busiest threads by replies, the first ranked in teal. */
export function TopDiscussionsCard({
  discussions,
  className,
}: {
  discussions: TopDiscussion[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("flex flex-col shadow-[0_2px_6px_rgb(24_28_30/0.04)]", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Top Discussions</DashboardCardTitle>
      <ol className="mt-6 flex flex-col gap-8 pl-3.5">
        {discussions.map((discussion, index) => (
          <li key={discussion.id} className="flex items-start gap-3">
            <span
              aria-hidden
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-sm text-lg",
                index === 0
                  ? "bg-[#d4e5eb] text-action dark:bg-action/25 dark:text-primary"
                  : "bg-muted-strong text-muted-foreground dark:bg-muted",
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[13px]/4 font-semibold tracking-wide">
                <span className="sr-only">{index + 1}. </span>
                {discussion.title}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <ChatsIcon aria-hidden weight="bold" className="size-3.5" />
                  {discussion.replies}
                  <span className="sr-only"> replies</span>
                </span>
                {discussion.tag && (
                  <>
                    <span aria-hidden className="size-1 rounded-full bg-border" />
                    <span
                      className={cn(
                        "flex items-center gap-0.5",
                        discussion.tag.tone === "event" &&
                          "text-caution-accent dark:text-[#e9b97c]",
                      )}
                    >
                      {discussion.tag.tone === "trending" && (
                        <TrendUpIcon aria-hidden weight="bold" className="size-3.5" />
                      )}
                      {discussion.tag.label}
                    </span>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-11 border-t border-border/50 pt-5 dark:border-border">
        <Button
          variant="outline"
          // UI only: the analytics pages have no design yet.
          onClick={() => toast("Discussion analytics aren't available yet")}
          className="h-10.5 w-full gap-2 rounded-md bg-surface text-base font-normal text-action hover:text-action dark:bg-input/30 dark:text-primary"
        >
          View Full Analytics
          <ArrowRightIcon aria-hidden weight="bold" className="size-4" />
        </Button>
      </div>
    </DashboardCard>
  );
}
