import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ChatsTeardropIcon,
  CurrencyDollarIcon,
  FunnelSimpleIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import { format, parseISO } from "date-fns";
import type { ReactNode } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { ToastButton } from "@/components/dashboard/toast-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COACH_STATUS, SESSION_STATUS } from "@/components/well-being/coach-styles";
import type { Coach, CoachKpi, CoachSession } from "@/types/well-being";

// The Figma repeats one target glyph on every card; these say what each figure counts.
const KPI_ICONS: Record<CoachKpi["id"], ReactNode> = {
  sessions: <ChatsTeardropIcon weight="bold" />,
  bookings: <CalendarCheckIcon weight="bold" />,
  rating: <StarIcon weight="bold" />,
  revenue: <CurrencyDollarIcon weight="bold" />,
};

/** The four coaching figures, each with its change against last month. */
export function CoachKpiGrid({ kpis }: { kpis: CoachKpi[] }) {
  return (
    <section aria-label="Coaching figures" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <DashboardCard key={kpi.id} className="pb-6">
          <div className="flex items-start justify-between gap-3">
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-lg bg-action-soft text-action dark:bg-action/25 dark:text-primary [&_svg]:size-5"
            >
              {KPI_ICONS[kpi.id]}
            </span>
            {/* Repeats the note below, so screen readers skip it. */}
            <span
              aria-hidden
              className="flex items-center gap-1 text-xs font-semibold tracking-wide text-success"
            >
              <TrendUpIcon weight="bold" className="size-3.5" />
              {kpi.change}%
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-5 tracking-wide text-muted-foreground">
            {kpi.label}
          </p>
          <p className="text-2xl leading-8 font-bold tabular-nums">
            {kpi.value}
            {kpi.suffix && (
              <span className="ml-1.5 text-sm font-normal text-[#6b7280] dark:text-subtle-foreground">
                {kpi.suffix}
              </span>
            )}
          </p>
          <p className="flex items-center gap-1 text-xs font-semibold tracking-wider text-success">
            <TrendUpIcon aria-hidden weight="bold" className="size-3.5" />
            {kpi.change}% vs last month
          </p>
        </DashboardCard>
      ))}
    </section>
  );
}

const headClass = "h-13 text-xs font-semibold tracking-wider text-muted-foreground uppercase";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function CoachAvatar({ coach }: { coach: Coach }) {
  return (
    <Avatar className="size-8">
      {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} alt="" />}
      <AvatarFallback className="bg-action-soft text-xs font-semibold text-action">
        {initials(coach.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** The roster's coaches with their session count, rating and whether they're free now. */
export function ActiveCoachesCard({ coaches }: { coaches: Coach[] }) {
  return (
    <DashboardCard className="overflow-hidden border-border/30 p-0 dark:border-border">
      <div className="flex items-center justify-between gap-4 bg-[#fbfcfe] px-6 py-6 dark:bg-transparent">
        <DashboardCardTitle id="active-coaches" className="text-xl leading-7 font-semibold">
          Active Coaches
        </DashboardCardTitle>
        {/* UI only: the Figma has no roster frame yet. */}
        <ToastButton
          message="The coach roster isn't available yet"
          className="flex items-center gap-1 rounded-md px-1 py-0.5 text-[13px] font-semibold tracking-wide text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
        >
          Manage Roster
          <ArrowRightIcon aria-hidden weight="bold" className="size-4" />
        </ToastButton>
      </div>
      <Table aria-labelledby="active-coaches" className="min-w-140">
        <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className={cn(headClass, "w-[31%] pl-6")}>Coach Name</TableHead>
            <TableHead className={cn(headClass, "w-[23%]")}>Sessions Hosted</TableHead>
            <TableHead className={cn(headClass, "w-[24%]")}>Rating</TableHead>
            <TableHead className={cn(headClass, "pr-6 text-right")}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.map((coach) => {
            const status = COACH_STATUS[coach.status];
            return (
              <TableRow
                key={coach.id}
                className="border-muted-strong hover:bg-transparent dark:border-border"
              >
                <TableCell className="py-3.75 pl-6">
                  <span className="flex items-center gap-4">
                    <CoachAvatar coach={coach} />
                    <span className="text-sm font-medium">{coach.name}</span>
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {coach.sessionsHosted}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  <span className="flex items-center gap-1">
                    {coach.rating.toFixed(1)}
                    <StarIcon aria-hidden weight="fill" className="size-4 text-[#ffb872]" />
                    <span className="sr-only">out of 5</span>
                  </span>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <span
                    className={cn(
                      "inline-flex h-5.5 items-center rounded-[4px] px-2 text-[11px] ring-1 ring-black/5 ring-inset",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}

/** The latest coaching sessions, booked or done, with who took them. */
export function RecentSessionsCard({
  sessions,
  coaches,
}: {
  sessions: CoachSession[];
  coaches: Coach[];
}) {
  const coachName = (id: string) => coaches.find((coach) => coach.id === id)?.name ?? "Unknown";
  return (
    <DashboardCard className="overflow-hidden border-border/30 p-0 dark:border-border">
      <div className="flex items-center justify-between gap-4 bg-[#fbfcfe] px-6 py-6 dark:bg-transparent">
        <DashboardCardTitle id="recent-sessions" className="text-xl leading-7 font-semibold">
          Recent Sessions History
        </DashboardCardTitle>
        <ToastButton
          message="Session filters aren't available yet"
          aria-label="Filter sessions"
          className="flex size-8 items-center justify-center rounded-md text-border outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-5" />
        </ToastButton>
      </div>
      <Table aria-labelledby="recent-sessions" className="min-w-140">
        <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className={cn(headClass, "w-[18%] pl-6")}>Date</TableHead>
            <TableHead className={cn(headClass, "w-[14%]")}>User ID</TableHead>
            <TableHead className={cn(headClass, "w-[19%]")}>Coach</TableHead>
            <TableHead className={cn(headClass, "w-[18%]")}>Theme</TableHead>
            <TableHead className={cn(headClass, "pr-6")}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const status = SESSION_STATUS[session.status];
            return (
              <TableRow
                key={session.id}
                className="border-muted-strong text-sm leading-5 hover:bg-transparent dark:border-border"
              >
                <TableCell className="py-3 pl-6 whitespace-normal">
                  <time dateTime={session.startsAt}>
                    {format(parseISO(session.startsAt), "MMM d, hh:mm a")}
                  </time>
                </TableCell>
                <TableCell className="font-mono text-[13px] whitespace-normal text-outline">
                  {session.userId}
                </TableCell>
                <TableCell className="whitespace-normal">{coachName(session.coachId)}</TableCell>
                <TableCell className="whitespace-normal">{session.theme}</TableCell>
                <TableCell className="pr-6">
                  <span
                    className={cn(
                      "inline-flex h-5.5 items-center rounded-[4px] px-2 text-[11px] ring-1 ring-black/5 ring-inset",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ToastButton
        message="The full session history isn't available yet"
        className="flex h-10 w-full items-center justify-center border-t border-muted-strong bg-muted text-[13px] font-semibold tracking-wide outline-none hover:bg-container focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset dark:border-border"
      >
        View All History
      </ToastButton>
    </DashboardCard>
  );
}
