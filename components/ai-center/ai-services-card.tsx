"use client";

import { cn } from "cn";
import { useId } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AiService } from "@/types/ai-center";

const COLUMNS = [
  { label: "Feature", width: "w-[29%]" },
  { label: "Requests today", width: "w-[15%]" },
  { label: "Success rate", width: "w-[14%]" },
  { label: "Avg response", width: "w-[15%]" },
  { label: "Adoption", width: "w-[15%]" },
  { label: "Status", width: "w-[12%]" },
];

const STATUS: Record<AiService["status"], { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-success/15 dark:text-success",
  },
  degraded: {
    label: "Degraded",
    className: "bg-caution-soft text-caution dark:bg-caution/30 dark:text-[#e9b97c]",
  },
  offline: { label: "Offline", className: "bg-muted-strong text-muted-foreground dark:bg-muted" },
};

const edges = "px-3 first:pl-6 last:pr-6";

/** Each AI service's load, reliability, speed and reach, with its running state. */
export function AiServicesCard({
  services,
  className,
}: {
  services: AiService[];
  className?: string;
}) {
  const titleId = useId();
  // UI only: the Figma has no frames for these yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <DashboardCard className={cn("overflow-hidden p-0", className)}>
      <div className="flex min-h-19 flex-wrap items-center justify-between gap-4 bg-muted px-6 py-4 dark:bg-muted/50">
        <DashboardCardTitle id={titleId} className="text-xl leading-7 font-semibold">
          AI Services Status
        </DashboardCardTitle>
        <div className="flex gap-2.5">
          {["Filter", "Sort"].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => notYet(`${action}ing services`)}
              className="h-7.5 rounded-md border border-border bg-background px-3.5 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
      <Table aria-labelledby={titleId} className="min-w-170">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
          <TableRow className="bg-surface hover:bg-surface">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-16 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
                  edges,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const status = STATUS[service.status];
            return (
              <TableRow key={service.id} className="border-muted dark:border-border">
                <TableCell
                  className={cn(edges, "py-4 text-base leading-6 font-semibold whitespace-normal")}
                >
                  {service.name}
                </TableCell>
                <TableCell className={cn(edges, "py-4 text-base tabular-nums")}>
                  {service.requestsToday}
                </TableCell>
                <TableCell className={cn(edges, "py-4 text-base tabular-nums")}>
                  {service.successRate}%
                </TableCell>
                <TableCell className={cn(edges, "py-4 text-base tabular-nums")}>
                  {service.avgResponse}s
                </TableCell>
                <TableCell className={cn(edges, "py-4")}>
                  <span
                    role="meter"
                    aria-label={`${service.name} adoption`}
                    aria-valuenow={service.adoption}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="block h-1.5 w-16 rounded-full bg-container dark:bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-action dark:bg-primary"
                      style={{ width: `${service.adoption}%` }}
                    />
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-4")}>
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full px-2.5 text-xs",
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
