"use client";

import {
  ChartPieSliceIcon,
  FunnelSimpleIcon,
  ListChecksIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  TimerIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PsychologyIcon } from "@/components/icons/app-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  matchesQuestionFilters,
  QUESTION_STATUS,
  QUESTION_STATUS_FILTERS,
  QUESTION_TYPE_FILTERS,
  QUESTION_TYPES,
} from "@/components/well-being/question-styles";
import { WellbeingFilterBar } from "@/components/well-being/wellbeing-filter-bar";
import type { AssessmentFunnel, AssessmentQuestion, AssessmentStat } from "@/types/well-being";

const STAT_ICONS: Record<AssessmentStat["id"], ReactNode> = {
  completions: <ListChecksIcon weight="bold" className="size-6 text-primary" />,
  score: <PsychologyIcon className="h-6 w-auto text-primary" />,
  "completion-rate": <ChartPieSliceIcon weight="bold" className="size-6 text-primary" />,
  time: <TimerIcon weight="bold" className="size-6 text-success-strong dark:text-success" />,
};

const count = new Intl.NumberFormat("en-US");

/** The assessment tab: filters, the four figures, the funnel and the question list. */
export function AssessmentOverview({
  stats,
  funnel,
  questions,
}: {
  stats: AssessmentStat[];
  funnel: AssessmentFunnel;
  questions: AssessmentQuestion[];
}) {
  const [filters, setFilters] = useState({ type: "all", status: "all" });
  const rows = questions.filter((question) => matchesQuestionFilters(question, filters));

  return (
    <>
      <WellbeingFilterBar
        category={filters.type}
        categories={QUESTION_TYPE_FILTERS}
        onCategoryChange={(type) => setFilters((current) => ({ ...current, type }))}
        status={filters.status}
        statuses={QUESTION_STATUS_FILTERS}
        onStatusChange={(status) => setFilters((current) => ({ ...current, status }))}
      />

      <section aria-label="Assessment figures" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardCard key={stat.id}>
            <p className="flex items-center gap-3 text-sm font-semibold tracking-wider text-muted-foreground">
              <span aria-hidden className="flex shrink-0">
                {STAT_ICONS[stat.id]}
              </span>
              {stat.label}
            </p>
            <p className="mt-2.5 text-[32px] leading-10 font-bold tabular-nums">{stat.value}</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                stat.tone === "positive" ? "text-success" : "text-primary",
              )}
            >
              {stat.note}
            </p>
          </DashboardCard>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <FunnelCard funnel={funnel} />
        <QuestionsCard questions={rows} className="xl:col-span-2" />
      </div>

      <p className="-mt-2 flex items-center justify-center gap-2 text-center text-sm text-[#989fa4]">
        <LockSimpleIcon aria-hidden weight="bold" className="size-4 shrink-0" />
        Privacy Notice: Individual responses are encrypted and private. Data shown is aggregated.
      </p>
    </>
  );
}

/** How many started, are part-way, and finished, as indented steps joined by a rail. */
function FunnelCard({ funnel }: { funnel: AssessmentFunnel }) {
  const steps = [
    { label: "Started", value: funnel.started, className: "w-full" },
    { label: "In Progress", value: funnel.inProgress, className: "ml-[6%] w-[70%]" },
    { label: "Completed", value: funnel.completed, className: "ml-[12%] w-[58%]", strong: true },
  ];

  return (
    <DashboardCard className="h-full pb-10">
      <DashboardCardTitle className="text-2xl leading-8 font-semibold">
        Assessment Funnel
      </DashboardCardTitle>
      <ol className="mt-20">
        {steps.map((step, index) => (
          <li key={step.label} className={cn("relative", index > 0 && "pt-6")}>
            {/* The rail from the step above. */}
            {index > 0 && (
              <span
                aria-hidden
                className="absolute top-0 left-[41%] h-6 w-0.5 bg-[#dbe1e5] dark:bg-border"
              />
            )}
            <div
              className={cn(
                "flex h-12 items-center justify-between gap-4 rounded-md border border-muted-strong bg-muted px-6 text-base font-semibold tracking-wide dark:border-border",
                step.className,
              )}
            >
              {step.label}
              <span className={cn("tabular-nums", step.strong && "text-action dark:text-primary")}>
                {count.format(step.value)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}

const COLUMNS = [
  { label: "#", className: "w-[11%] text-center" },
  { label: "Question Text", className: "w-[25%]" },
  { label: "Type", className: "w-[17%]" },
  { label: "Required", className: "w-[13%] text-center" },
  { label: "Status", className: "w-[12%] text-center" },
  { label: "Actions", className: "w-[22%] pl-8" },
];

/** The assessment's questions in order, each linking to the question editor. */
function QuestionsCard({
  questions,
  className,
}: {
  questions: AssessmentQuestion[];
  className?: string;
}) {
  const titleId = useId();
  return (
    <DashboardCard className={cn("overflow-hidden p-0", className)}>
      <div className="flex items-center justify-between gap-4 px-6 py-7.5">
        <DashboardCardTitle id={titleId} className="text-2xl leading-8 font-semibold">
          Question Management
        </DashboardCardTitle>
        {/* UI only: the Figma has no frames for these. */}
        <button
          type="button"
          aria-label="Filter questions"
          onClick={() => toast("Question filters aren't available yet")}
          className="flex size-8 items-center justify-center rounded-md text-border outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-5" />
        </button>
      </div>
      <Table aria-labelledby={titleId} className="min-w-160">
        <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
          <TableRow className="bg-muted hover:bg-muted">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn("h-14 text-base font-normal text-outline", column.className)}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => {
            const status = QUESTION_STATUS[question.status];
            return (
              <TableRow key={question.id} className="border-muted-strong dark:border-border">
                <TableCell className="py-3 text-center text-base text-border tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="py-3 text-lg leading-7 whitespace-normal">
                  {question.text}
                </TableCell>
                <TableCell className="py-3">
                  <span className="inline-flex max-w-28 items-center rounded-md bg-container px-2.5 py-1 text-sm leading-5 whitespace-normal text-muted-foreground dark:bg-muted">
                    {QUESTION_TYPES[question.type].pill}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "py-3 text-center text-lg",
                    question.required ? "text-foreground" : "text-border",
                  )}
                >
                  <span aria-hidden>{question.required ? "Y" : "N"}</span>
                  <span className="sr-only">{question.required ? "Required" : "Optional"}</span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span
                    className={cn(
                      "inline-flex h-7 items-center rounded-full px-3 text-sm",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className="py-3 pl-8">
                  <Link
                    href="/well-being/assessment/questions"
                    aria-label={`Edit question ${index + 1}`}
                    className="inline-flex size-9 items-center justify-center rounded-md text-outline outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <PencilSimpleIcon aria-hidden className="size-5" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
          {questions.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-32 text-center text-muted-foreground"
              >
                No questions match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
