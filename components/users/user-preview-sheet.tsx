"use client";

import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  ClockIcon,
  IdentificationCardIcon,
  ProhibitIcon,
  SealCheckIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as SheetPrimitive } from "radix-ui";
import type { ReactNode, RefObject } from "react";
import { toast } from "sonner";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Dialog } from "@/components/ui/dialog";
import { PlanBadge, StatusBadge, UserAvatar } from "@/components/users/user-badges";
import type { UserDetail } from "@/types/users";

const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const compact = new Intl.NumberFormat("en-US", { notation: "compact" });
const rating = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A user's profile at a glance from the directory: who they are, activity, safety, and account actions. */
export function UserPreviewSheet({
  user,
  open,
  onOpenChange,
  returnFocusRef,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What had focus before the sheet opened: it opens from a row, not a trigger. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className="max-w-100"
      >
        <div className="flex h-17 shrink-0 items-start justify-between gap-4 border-b px-6 pt-4.25">
          <SheetPrimitive.Title className="text-base font-semibold">
            User Profile Preview
          </SheetPrimitive.Title>
          <SheetPrimitive.Close className="-m-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
            <XIcon aria-hidden weight="bold" className="size-5" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </div>
        {user && <PreviewBody user={user} />}
      </ActionSheetContent>
    </Dialog>
  );
}

function PreviewBody({ user }: { user: UserDetail }) {
  // UI only: none of these reach /admin/users or the verification endpoints yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-8.5 pb-8">
      <SheetPrimitive.Description className="sr-only">
        {user.name}&apos;s account, activity and safety status.
      </SheetPrimitive.Description>

      <div className="flex flex-col items-center text-center">
        <UserAvatar
          user={user}
          size="lg"
          className="rounded-full shadow-[0_4px_12px_rgb(0_0_0/0.12)]"
        />
        <p className="mt-7 text-base font-semibold">{user.name}</p>
        <p className="text-base text-muted-foreground">{user.headline}</p>
        <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
          {user.suspended ? (
            <StatusBadge status="suspended" className="h-4 text-[10px]" />
          ) : (
            <StatusBadge status={user.verification} className="h-4 text-[10px]" />
          )}
          <PlanBadge plan={user.plan} size="sm" className="h-4" />
        </div>
      </div>

      <dl className="mt-10.5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[16px] bg-muted p-6">
        <Fact label="User ID">
          <span className="text-action dark:text-primary">#{user.publicId}</span>
        </Fact>
        <Fact label="Member since">
          <time dateTime={user.memberSince}>{day.format(new Date(user.memberSince))}</time>
        </Fact>
        <Fact label="Gender/Age">
          {user.gender}, {user.age}
        </Fact>
        <Fact label="Country">{user.country}</Fact>
      </dl>

      <dl className="mt-10 grid grid-cols-3 gap-2">
        <Stat label="Matches" value={compact.format(user.matches).toLowerCase()} />
        <Stat label="Dates" value={compact.format(user.dates).toLowerCase()} />
        <Stat label="Rating" value={rating.format(user.rating)} />
      </dl>

      <h3 className="mt-10 text-base font-semibold tracking-wide text-muted-foreground uppercase">
        Safety &amp; status
      </h3>
      <ul className="mt-3 flex flex-col gap-3">
        <SafetyRow
          icon={<IdentificationCardIcon weight="bold" />}
          tile="bg-green-100 text-green-700 dark:bg-success/15 dark:text-success"
          title="Identity Verification"
          detail={
            user.verification === "verified"
              ? `Verified via ${user.verifiedWith ?? "ID document"}`
              : user.verification === "pending"
                ? "Awaiting review"
                : "Not verified"
          }
        >
          {user.verification === "verified" ? (
            <CheckCircleIcon aria-hidden weight="bold" className="size-6 text-success" />
          ) : user.verification === "pending" ? (
            <ClockIcon
              aria-hidden
              weight="bold"
              className="size-6 text-caution dark:text-[#e9b97c]"
            />
          ) : (
            <XCircleIcon aria-hidden weight="bold" className="size-6 text-muted-foreground" />
          )}
        </SafetyRow>
        <SafetyRow
          icon={<WarningIcon weight="bold" />}
          tile="bg-caution-soft text-caution dark:bg-caution/30 dark:text-[#e9b97c]"
          title="Reports"
          detail={`${user.activeReports} Active ${user.activeReports === 1 ? "report" : "reports"}`}
        >
          <span
            className={cn(
              "text-base font-semibold uppercase",
              user.activeReports === 0 ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {user.activeReports === 0 ? "Clean" : "Flagged"}
          </span>
        </SafetyRow>
      </ul>

      <div className="mt-16 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => notYet("Re-verifying identity")}
          className="flex h-13 items-center justify-center gap-2 rounded-[10px] bg-action text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgb(0_100_129/0.6)] transition-colors outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <SealCheckIcon aria-hidden weight="bold" className="size-5.5" />
          Re-verify Identity
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          {user.suspended ? (
            <button
              type="button"
              onClick={() => notYet("Restoring a user")}
              className="flex h-13 items-center justify-center gap-1.5 rounded-[10px] border border-primary/25 bg-accent text-base font-semibold text-primary transition-colors outline-none hover:bg-accent/70 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowCounterClockwiseIcon aria-hidden weight="bold" className="size-4.5" />
              Restore
            </button>
          ) : (
            <button
              type="button"
              onClick={() => notYet("Suspending a user")}
              className="flex h-13 items-center justify-center gap-1.5 rounded-[10px] border border-[#f2d3d3] bg-[#f8e8e8] text-base font-semibold text-destructive transition-colors outline-none hover:bg-[#f4dcdc] focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-destructive/40 dark:bg-destructive/15"
            >
              <ProhibitIcon aria-hidden weight="bold" className="size-4.5" />
              Suspend
            </button>
          )}
          <button
            type="button"
            onClick={() => notYet("Deleting a user")}
            className="flex h-13 items-center justify-center gap-1.5 rounded-[10px] border bg-muted-strong text-base font-semibold text-muted-foreground transition-colors outline-none hover:bg-[#dcdfe3] focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted"
          >
            <TrashIcon aria-hidden weight="bold" className="size-4.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold">{children}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-16 flex-col-reverse items-center justify-center rounded-lg border border-muted-strong">
      <dt className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  );
}

function SafetyRow({
  icon,
  tile,
  title,
  detail,
  children,
}: {
  icon: ReactNode;
  tile: string;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <li className="flex min-h-24 items-center gap-6 rounded-xl border border-muted px-6 py-4 dark:border-muted-strong/20">
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-5",
          tile,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-base text-muted-foreground">{detail}</p>
      </div>
      {children}
    </li>
  );
}
