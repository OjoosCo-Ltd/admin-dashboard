"use client";

import {
  DotsSixVerticalIcon,
  ListBulletsIcon,
  PlantIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TimerIcon,
  TreeStructureIcon,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { type KeyboardEvent, useId, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AssessmentGuideSheet } from "@/components/well-being/assessment-guide-sheet";
import { QuestionDialog } from "@/components/well-being/question-dialog";
import {
  matchesQuestionFilters,
  QUESTION_STATUS_FILTERS,
  QUESTION_TYPE_FILTERS,
  QUESTION_TYPES,
} from "@/components/well-being/question-styles";
import { WellbeingFilterBar } from "@/components/well-being/wellbeing-filter-bar";
import type {
  AssessmentQuestion,
  AssessmentSettings,
  LogicRule,
  QuestionType,
} from "@/types/well-being";

// ⚠️ PROVISIONAL: the scoring models a backend would list.
const SCORING_MODELS = ["Intentional Wellness v1.2", "Intentional Wellness v1.1", "Baseline Sum"];

/** How a rule's condition reads on its chip. */
const CONDITIONS: Record<LogicRule["operator"], (value: string) => string> = {
  is: (value) => `If '${value}'`,
  "is-not": (value) => `If not '${value}'`,
  "greater-than": (value) => `If over ${value}`,
  "less-than": (value) => `If under ${value}`,
};

const HINT_ICONS: Partial<Record<QuestionType, Icon>> = {
  "multiple-choice": ListBulletsIcon,
};

/**
 * The question editor: filters, the privacy notice, the ordered questions (drag
 * or arrow keys to reorder), the add dialog, and the assessment's settings.
 * UI only: the order, new questions and settings stay in the page until saved,
 * and Save Changes has no endpoint yet.
 */
export function QuestionBuilder({
  initialQuestions,
  initialSettings,
}: {
  initialQuestions: AssessmentQuestion[];
  initialSettings: AssessmentSettings;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [filters, setFilters] = useState({ type: "all", status: "all" });
  const [dragging, setDragging] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const position = (id: string) => questions.findIndex((question) => question.id === id);

  const move = (id: string, to: number) => {
    const from = position(id);
    if (from < 0 || to < 0 || to >= questions.length || from === to) return;
    const next = [...questions];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setQuestions(next);
    setAnnouncement(`Question moved to position ${to + 1} of ${next.length}.`);
  };

  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    move(id, position(id) + (event.key === "ArrowUp" ? -1 : 1));
    // The list re-renders in the new order; keep focus on the moved handle.
    requestAnimationFrame(() => document.getElementById(`handle-${id}`)?.focus());
  };

  const add = (question: AssessmentQuestion) => {
    setQuestions((current) => [...current, question]);
    toast("Question added. Save Changes to keep it.");
  };

  const visible = questions.filter((question) => matchesQuestionFilters(question, filters));

  const addTrigger = (variant: "dashed" | "solid") => (
    <button
      type="button"
      className={cn(
        "flex h-12.5 w-full items-center justify-center gap-2.5 rounded-lg border-2 text-base font-semibold tracking-wide text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        variant === "dashed" ? "border-dashed border-border" : "border-border bg-transparent",
      )}
    >
      <PlusCircleIcon aria-hidden weight="bold" className="size-6" />
      {variant === "dashed" ? "Add New Question to Sequence" : "Add Question"}
    </button>
  );

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

      <p className="flex gap-3 rounded-lg border border-info-soft bg-[#e9f4fb] px-4 py-4 text-base leading-6 font-semibold dark:border-border dark:bg-info-soft/10">
        <ShieldCheckIcon
          aria-hidden
          weight="bold"
          className="mt-0.5 size-6 shrink-0 text-review dark:text-subtle-foreground"
        />
        <span>
          <strong className="font-bold">Admin Privacy Notice:</strong> Individual user responses are
          not accessible from this interface. Only aggregate completion data and question
          configuration are managed here to protect member confidentiality.
        </span>
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <section aria-labelledby="sequence-title" className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-muted-strong pb-4 dark:border-border">
            <h2 id="sequence-title" className="text-2xl leading-8 font-semibold max-sm:text-xl">
              Question Sequence
            </h2>
            <span className="shrink-0 rounded-md bg-muted-strong px-2 py-1 text-sm whitespace-nowrap text-muted-foreground dark:bg-muted">
              {questions.length} Questions Total
            </span>
          </div>
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
          <ol className="mt-8 flex flex-col gap-3.5">
            {visible.map((question) => {
              const index = position(question.id);
              const type = QUESTION_TYPES[question.type];
              const HintIcon = HINT_ICONS[question.type];
              const rule = question.rules[0];
              const outcome =
                rule &&
                (rule.skipTo === "end"
                  ? "Ends Assessment"
                  : `Branches to Q${position(rule.skipTo) + 1}`);
              return (
                <li
                  key={question.id}
                  draggable
                  onDragStart={(event) => {
                    setDragging(question.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDragging(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragging) move(dragging, index);
                    setDragging(null);
                  }}
                  className={cn(
                    "flex gap-3 rounded-lg border bg-card p-5 pl-4 transition-opacity dark:border-border",
                    rule && "border-l-4 border-l-caution dark:border-l-[#e9b97c]",
                    dragging === question.id && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    id={`handle-${question.id}`}
                    aria-label={`Reorder question ${index + 1}. Use the up and down arrow keys.`}
                    onKeyDown={(event) => onHandleKey(event, question.id)}
                    className="mt-0.5 flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-outline outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
                  >
                    <DotsSixVerticalIcon aria-hidden weight="bold" className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold">Q{index + 1}</span>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-semibold tracking-wide uppercase",
                          type.chipClass,
                        )}
                      >
                        {type.chip}
                      </span>
                      <span className="rounded bg-muted-strong px-2 py-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase dark:bg-muted">
                        {question.status}
                      </span>
                      {question.required && <span className="sr-only">Required</span>}
                    </div>
                    <p className="mt-2 max-w-2xl text-xl leading-7">{question.text}</p>
                    {question.hint && (
                      <p className="mt-2 flex items-center gap-1.5 text-base text-outline">
                        {HintIcon && <HintIcon aria-hidden weight="bold" className="size-4.5" />}
                        {question.hint}
                      </p>
                    )}
                    {rule && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#fff1e3] px-3 py-1.5 text-base text-[#854f0f] dark:bg-caution/25 dark:text-[#e9b97c]">
                        <TreeStructureIcon aria-hidden weight="bold" className="size-4.5" />
                        Logic: {CONDITIONS[rule.operator](rule.value)}, {outcome}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-lg border border-dashed px-6 py-10 text-center text-muted-foreground">
                No questions match these filters.
              </li>
            )}
          </ol>
          <div className="mt-6">
            <QuestionDialog questions={questions} onAdd={add} trigger={addTrigger("dashed")} />
          </div>
          <div className="mt-10">
            <QuestionDialog questions={questions} onAdd={add} trigger={addTrigger("solid")} />
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <SettingsCard initial={initialSettings} />
          <HelpCard />
        </div>
      </div>
    </>
  );
}

/** The assessment-wide settings: its title, estimated time, scoring and the two switches. */
function SettingsCard({ initial }: { initial: AssessmentSettings }) {
  const id = useId();
  const [settings, setSettings] = useState(initial);
  const update = (patch: Partial<AssessmentSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));

  const label = "text-[13px] font-medium tracking-wider text-muted-foreground uppercase";

  return (
    <DashboardCard className="p-6 sm:p-6">
      <DashboardCardTitle className="flex items-center gap-2.5 text-2xl leading-8 font-semibold">
        <SlidersHorizontalIcon
          aria-hidden
          weight="bold"
          className="size-6 text-action dark:text-primary"
        />
        Global Settings
      </DashboardCardTitle>

      <label htmlFor={`${id}-title`} className={cn(label, "mt-6 block")}>
        Assessment Title
      </label>
      <Input
        id={`${id}-title`}
        value={settings.title}
        onChange={(event) => update({ title: event.target.value })}
        className="mt-2 h-11 rounded-md border-muted-strong bg-surface px-4 text-base md:text-[17px] dark:border-border"
      />

      <div className="mt-4 flex items-center justify-between gap-4 rounded-md bg-muted px-4 py-3.5">
        <div>
          <p className={label}>Est. time</p>
          <p className="text-2xl leading-8 font-semibold">{settings.estimatedTime}</p>
        </div>
        <TimerIcon aria-hidden weight="bold" className="size-8 text-outline" />
      </div>

      <span id={`${id}-scoring`} className={cn(label, "mt-5 block")}>
        Scoring Model
      </span>
      <Select
        value={settings.scoringModel}
        onValueChange={(scoringModel) => update({ scoringModel })}
      >
        <SelectTrigger
          aria-labelledby={`${id}-scoring`}
          className="mt-2 h-11 w-full rounded-md border-muted-strong bg-transparent px-3.5 text-[17px] data-[size=default]:h-11 dark:border-border [&_svg:not([class*='size-'])]:size-4.5"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {SCORING_MODELS.map((model) => (
            <SelectItem key={model} value={model} className="text-sm">
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <hr className="my-5 border-muted-strong dark:border-border" />

      {(
        [
          {
            key: "requireCompletion",
            title: "Require Completion",
            detail: "Users must answer all visible questions.",
          },
          { key: "showProgress", title: "Show Progress Bar" },
        ] as const
      ).map((toggle) => (
        <label
          key={toggle.key}
          className="mt-4 flex cursor-pointer items-center justify-between gap-6 first-of-type:mt-0"
        >
          <span>
            <span className="block text-base font-semibold tracking-wide">{toggle.title}</span>
            {"detail" in toggle && (
              <span className="mt-0.5 block text-sm text-muted-foreground">{toggle.detail}</span>
            )}
          </span>
          <Switch
            checked={settings[toggle.key]}
            onCheckedChange={(checked) => update({ [toggle.key]: checked })}
            className="h-8 w-15 data-[size=default]:h-8 data-[size=default]:w-15 data-checked:bg-action dark:data-checked:bg-primary [&_[data-slot=switch-thumb]]:size-6.5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-[calc(100%+2px)] [&_[data-slot=switch-thumb]]:data-unchecked:translate-x-0.5"
          />
        </label>
      ))}
    </DashboardCard>
  );
}

/** A teal card pointing to guidance on writing good assessment questions. */
function HelpCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#257897] to-[#05536c] p-8 text-white">
      <PlantIcon
        aria-hidden
        weight="bold"
        className="pointer-events-none absolute -top-6 -right-8 size-28 text-white/[0.07]"
      />
      <h2 className="relative text-2xl leading-8 font-semibold">Need help structuring?</h2>
      <p className="relative mt-2 text-base leading-6 text-[#b5dcec]">
        View best practices for psychological assessment design.
      </p>
      <AssessmentGuideSheet
        trigger={
          <button
            type="button"
            className="relative mt-6 flex h-11 w-full items-center justify-center rounded-md bg-white text-base font-semibold tracking-wide text-action-icon outline-none hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/60"
          >
            View Guide
          </button>
        }
      />
    </section>
  );
}
