"use client";

import { DotsThreeCircleIcon, FunnelSimpleIcon, SealCheckIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { useId } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enabled, FEATURES, type Feature } from "@/constants/features";
import type { RecentUser, SubscriptionPlan } from "@/types/dashboard";

// Each column's share (%) of the Figma's 1,112px table, scaled up to fill the
// width when a column is hidden. They're targets: a column still grows to fit
// its content, and the table scrolls sideways when it can't fit.
const COLUMNS = enabled<{ label: string; share: number; feature?: Feature }>([
  { label: "User", share: 18.75 },
  { label: "Age/Country", share: 18.25 },
  { label: "Verification", share: 17.45 },
  { label: "Subscription", share: 18.15, feature: "subscriptions" },
  { label: "Status", share: 10.85, feature: "presence" },
  { label: "Last active", share: 16.55 },
]);
const SHARES = COLUMNS.reduce((sum, column) => sum + column.share, 0);

const PLAN_STYLES: Record<SubscriptionPlan, string> = {
  elite: "bg-elite font-bold text-white",
  premium: "bg-accent font-bold text-primary",
  free: "bg-muted-strong font-medium text-muted-foreground dark:bg-muted",
};

const cell = "px-6 py-4.25";

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/** The latest sign-ups and logins, with a link through to the full user list. */
export function RecentUsersTable({
  users,
  totalUsers,
  className,
}: {
  users: RecentUser[];
  totalUsers: number;
  className?: string;
}) {
  const titleId = useId();

  return (
    <DashboardCard className={cn("overflow-hidden p-0", className)}>
      <div className="flex items-center justify-between gap-4 border-b p-6">
        <DashboardCardTitle id={titleId}>Recent User Activity</DashboardCardTitle>
        {/* UI only: there are no filters to open yet. */}
        <Button
          variant="outline"
          size="icon"
          aria-label="Filter users"
          onClick={() => toast("Filters aren't available yet")}
          className="size-9 rounded-md text-muted-foreground"
        >
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-5" />
        </Button>
      </div>
      <Table aria-labelledby={titleId}>
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} style={{ width: `${(column.share / SHARES) * 100}%` }} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-muted hover:bg-muted">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className="h-18 px-6 text-base font-semibold tracking-[0.06em] text-muted-foreground uppercase"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className={cell}>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-accent text-sm font-semibold text-primary">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-base font-bold whitespace-normal text-foreground">
                      {user.name}
                    </p>
                    <p
                      title={user.email}
                      className="max-w-48 truncate text-[11px] leading-3.5 font-medium text-muted-foreground"
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cn(cell, "text-sm whitespace-normal text-foreground")}>
                {/* The Figma wraps the country under the age at this width. */}
                <span className="block max-w-28">
                  {user.age} / {user.country}
                </span>
              </TableCell>
              <TableCell className={cell}>
                {user.verification === "verified" ? (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-success">
                    <SealCheckIcon aria-hidden weight="fill" className="size-4.25" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
                    <DotsThreeCircleIcon aria-hidden className="size-4" />
                    Pending
                  </span>
                )}
              </TableCell>
              {FEATURES.subscriptions && (
                <TableCell className={cell}>
                  <span
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-base uppercase",
                      PLAN_STYLES[user.plan],
                    )}
                  >
                    {user.plan}
                  </span>
                </TableCell>
              )}
              {FEATURES.presence && (
                <TableCell className={cell}>
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[13px] font-semibold",
                      user.online ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 rounded-full",
                        user.online ? "bg-online" : "bg-outline",
                      )}
                    />
                    {user.online ? "Active" : "Offline"}
                  </span>
                </TableCell>
              )}
              {/* Right-aligned short of the header's edge, as in the Figma. */}
              <TableCell
                className={cn(
                  cell,
                  "pr-16 text-right text-[11px] font-medium text-muted-foreground",
                )}
              >
                {user.lastActive}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No recent user activity.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex h-18 items-center justify-center bg-muted px-6">
        <Link
          href="/users"
          className="rounded-sm text-xs font-semibold tracking-[0.06em] text-primary outline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          Show all {compact.format(totalUsers).toLowerCase()} users
        </Link>
      </div>
    </DashboardCard>
  );
}
