"use client";

import {
  ArrowRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  UsersIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { EventStatusBadge } from "@/components/community/community-badges";
import { EventFormDialog } from "@/components/community/event-form-dialog";
import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FEATURES } from "@/constants/features";
import type { CommunityEvent } from "@/types/community";

const count = new Intl.NumberFormat("en-US");

const sectionLabel =
  "text-xs/4 font-semibold tracking-wider text-action uppercase dark:text-primary";
const fieldLabel = "text-[11px]/4 font-medium tracking-wide text-muted-foreground uppercase";

/**
 * An event's detail panel, opened from the events table: its banner and
 * description, when and where, attendance against capacity and the latest
 * RSVPs, with Cancel Event and Edit Event below.
 */
export function EventSheet({
  event,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  event?: CommunityEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rows open the sheet without a trigger, so the caller says where focus goes back to. */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const [editing, setEditing] = useState(false);
  // However the sheet closes, it reopens without the edit dialog up.
  if (!open && editing) setEditing(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent
        nestedOpen={editing}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-120 border-border"
      >
        {event && <SheetContents event={event} editing={editing} onEditingChange={setEditing} />}
      </ActionSheetContent>
    </Dialog>
  );
}

function SheetContents({
  event,
  editing,
  onEditingChange,
}: {
  event: CommunityEvent;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
}) {
  const { capacity } = event;
  const rate = capacity ? Math.round((event.attendees / capacity) * 100) : null;

  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-6 py-6 max-sm:px-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <DialogPrimitive.Title className="text-xl/7 font-semibold">
            {event.title}
          </DialogPrimitive.Title>
          <EventStatusBadge status={event.status} />
        </div>
        <DialogPrimitive.Close className="-mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-4.5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      {/* Without the banner, a hairline sets the details apart from the title, as the footer's does. */}
      <div className={cn("min-h-0 flex-1 overflow-y-auto", !FEATURES.eventMedia && "border-t")}>
        {FEATURES.eventMedia && (
          // eslint-disable-next-line @next/next/no-img-element -- a sample cover; next/image once the API's URLs are wired
          <img src={event.imageUrl} alt="" className="h-50 w-full bg-muted object-cover" />
        )}

        <div className="px-6 pt-6 pb-8 max-sm:px-4">
          <h3 className={sectionLabel}>Event Information</h3>
          <DialogPrimitive.Description className="mt-4 text-sm/5 text-muted-foreground">
            {event.description}
          </DialogPrimitive.Description>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 rounded-xl border border-border/50 bg-muted p-4 dark:border-border dark:bg-muted/50">
            <InfoItem icon={<CalendarBlankIcon className="size-6" />} label="Date">
              {event.shortDate}
            </InfoItem>
            <InfoItem icon={<ClockIcon className="size-6" />} label="Time">
              {event.timeRange}
            </InfoItem>
            <InfoItem
              icon={<UsersThreeIcon className="size-6" />}
              label="Community"
              className="col-span-2"
            >
              {event.community.groupId ? (
                <Link
                  href={`/community/groups/${event.community.groupId}`}
                  className="rounded-xs text-action underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
                >
                  {event.community.name}
                </Link>
              ) : (
                event.community.name
              )}
            </InfoItem>
          </dl>

          <h3 className={cn(sectionLabel, "mt-7")}>Participation Metrics</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Total Attendees" value={count.format(event.attendees)}>
              <UsersIcon
                aria-hidden
                weight="bold"
                className="size-6 text-review dark:text-subtle-foreground"
              />
            </Metric>
            <Metric
              label="Available Spots"
              value={capacity ? count.format(Math.max(0, capacity - event.attendees)) : "Unlimited"}
              valueClassName={cn("text-action dark:text-primary", !capacity && "text-2xl/10")}
            >
              {capacity && (
                <span className="text-sm text-muted-foreground">/ {count.format(capacity)}</span>
              )}
            </Metric>
          </div>
          {rate !== null && (
            <div className="mt-5">
              <div className="flex justify-between text-xs/4 text-muted-foreground">
                <span id="attendance-rate">Attendance Rate</span>
                <span>{rate}%</span>
              </div>
              <div
                role="progressbar"
                aria-labelledby="attendance-rate"
                aria-valuenow={rate}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2 h-2 overflow-hidden rounded-full bg-[#e0e3e6] dark:bg-muted-strong/15"
              >
                <div
                  className="h-full rounded-full bg-action dark:bg-primary"
                  style={{ width: `${Math.min(rate, 100)}%` }}
                />
              </div>
            </div>
          )}

          <h3 className={cn(sectionLabel, "mt-8")}>Recent Activity</h3>
          {/* The rail runs down the dots' centers, from the first entry to the last. */}
          <ol className="relative mt-5 flex flex-col gap-6 before:absolute before:inset-y-0 before:left-0.75 before:w-px before:bg-border">
            {event.activity.map((item) => (
              <li key={item.id} className="relative pl-7">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1 left-0 size-2 rounded-full ring-2 ring-background",
                    item.kind === "cancelled" ? "bg-destructive" : "bg-action dark:bg-primary",
                  )}
                />
                <p className="text-sm/5 font-semibold">{item.text}</p>
                <p className="text-xs/4 text-muted-foreground">{item.time}</p>
              </li>
            ))}
          </ol>
          <button
            type="button"
            // UI only: there's no attendee list to open yet.
            onClick={() => toast("The attendee list isn't available yet")}
            className="mt-6 flex items-center gap-1 rounded-xs text-[13px]/5 font-semibold tracking-wide text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
          >
            View Full Attendee List
            <ArrowRightIcon aria-hidden weight="bold" className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 border-t px-6 py-6 max-sm:p-4">
        <Button
          variant="outline"
          // UI only: PATCH /community/events/{id} with isCancelled isn't wired.
          onClick={() => toast("Cancelling events isn't available yet")}
          disabled={event.status === "completed" || event.status === "cancelled"}
          className="h-14 rounded-[12px] border-destructive bg-background text-[17px] font-semibold text-destructive hover:bg-destructive-soft hover:text-destructive dark:border-destructive/70 dark:hover:bg-destructive/10"
        >
          Cancel Event
        </Button>
        <EventFormDialog
          event={event}
          open={editing}
          onOpenChange={onEditingChange}
          trigger={
            <Button className="h-14 rounded-[12px] bg-action text-[17px] font-semibold text-white hover:bg-action/90 dark:bg-primary dark:text-primary-foreground">
              Edit Event
            </Button>
          }
        />
      </div>
    </>
  );
}

function InfoItem({
  icon,
  label,
  children,
  className,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <span aria-hidden className="mt-0.5 shrink-0 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className={fieldLabel}>{label}</dt>
        <dd className="text-[15px]/5.5">{children}</dd>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  valueClassName,
  children,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  /** Set at the bottom right: an icon, or the capacity. */
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted px-4 pt-3.5 pb-3 dark:border-border dark:bg-muted/50">
      <p className="text-xs/4 text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className={cn("text-4xl/10 font-semibold tabular-nums", valueClassName)}>{value}</p>
        <span className="mb-1">{children}</span>
      </div>
    </div>
  );
}
