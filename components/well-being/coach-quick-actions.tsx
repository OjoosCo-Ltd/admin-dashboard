"use client";

import { CalendarDotsIcon, DownloadSimpleIcon, UserPlusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { AddCoachDialog } from "@/components/well-being/add-coach-dialog";
import { AvailabilitySheet } from "@/components/well-being/availability-sheet";
import { ExportSessionsDialog } from "@/components/well-being/export-sessions-dialog";
import type { Coach, CoachAvailability } from "@/types/well-being";

function ActionRow({ icon, children, ...props }: { icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-12 w-full items-center justify-between gap-3 rounded-xl bg-background px-3.5 text-left text-base outline-none hover:bg-background/70 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card dark:hover:bg-accent"
    >
      {children}
      <span aria-hidden className="text-border [&_svg]:size-5.5">
        {icon}
      </span>
    </button>
  );
}

/** Shortcuts to add a coach, set a coach's hours, and export sessions. */
export function CoachQuickActions({
  coach,
  availability,
}: {
  /** The coach whose hours Manage Availability opens. */
  coach: Coach;
  availability: CoachAvailability;
}) {
  return (
    <section
      aria-labelledby="coach-quick-actions"
      className="rounded-2xl bg-muted px-6 pt-7 pb-6 dark:bg-muted/50"
    >
      <h2
        id="coach-quick-actions"
        className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        Quick Actions
      </h2>
      <div className="mt-4 flex flex-col gap-2.5">
        <AddCoachDialog trigger={<ActionRow icon={<UserPlusIcon />}>Add New Coach</ActionRow>} />
        <AvailabilitySheet
          coach={coach}
          availability={availability}
          trigger={<ActionRow icon={<CalendarDotsIcon />}>Manage Availability</ActionRow>}
        />
        <ExportSessionsDialog
          trigger={<ActionRow icon={<DownloadSimpleIcon />}>Export Session Data</ActionRow>}
        />
      </div>
    </section>
  );
}
