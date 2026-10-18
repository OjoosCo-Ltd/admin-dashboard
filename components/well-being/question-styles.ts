import type { AssessmentQuestion, QuestionType } from "@/types/well-being";

/** Each question type's names: the table's pill, the sequence's chip, and the type picker. */
export const QUESTION_TYPES: Record<
  QuestionType,
  { pill: string; chip: string; option: string; chipClass: string }
> = {
  scale: {
    pill: "Scale (1-10)",
    chip: "Scale 1-10",
    option: "Scale 1-10",
    chipClass: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  "multiple-choice": {
    pill: "Multiple Choice",
    chip: "Multiple Choice",
    option: "Multiple choice",
    chipClass: "bg-[#e5f3fb] text-review dark:bg-review/30 dark:text-subtle-foreground",
  },
  "yes-no": {
    pill: "Yes/No",
    chip: "Yes / No",
    option: "Yes / No",
    chipClass: "bg-muted-strong text-muted-foreground dark:bg-muted",
  },
  "free-text": {
    pill: "Free Text",
    chip: "Free Text",
    option: "Free text",
    chipClass: "bg-muted-strong text-muted-foreground dark:bg-muted",
  },
};

export const QUESTION_STATUS: Record<
  AssessmentQuestion["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-[#e3edf4] text-[#2d80a0] dark:bg-action/25 dark:text-primary",
  },
  draft: {
    label: "Draft",
    className: "bg-[#e0e3e6] text-outline dark:bg-muted dark:text-muted-foreground",
  },
};

/** The filter bar's options on the assessment pages: question types stand in for categories. */
export const QUESTION_TYPE_FILTERS = [
  { value: "all", label: "All Categories" },
  ...Object.entries(QUESTION_TYPES).map(([value, type]) => ({ value, label: type.option })),
];

export const QUESTION_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

/** Whether a question passes the type and status filters. */
export const matchesQuestionFilters = (
  question: AssessmentQuestion,
  filters: { type: string; status: string },
) =>
  (filters.type === "all" || question.type === filters.type) &&
  (filters.status === "all" || question.status === filters.status);
