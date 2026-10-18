"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon, TreeStructureIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPES } from "@/components/well-being/question-styles";
import type { AssessmentQuestion, LogicRule, QuestionType } from "@/types/well-being";

const OPERATORS: { value: LogicRule["operator"]; label: string }[] = [
  { value: "is", label: "Answer is" },
  { value: "is-not", label: "Answer is not" },
  { value: "greater-than", label: "Answer is over" },
  { value: "less-than", label: "Answer is under" },
];

const schema = z.object({
  text: z.string().trim().min(1, "Write the question").max(200, "Keep it under 200 characters"),
  type: z.enum(["scale", "multiple-choice", "yes-no", "free-text"]),
  required: z.boolean(),
  rules: z.array(
    z.object({
      operator: z.enum(["is", "is-not", "greater-than", "less-than"]),
      value: z.string().trim().min(1, "Add the answer to match"),
      skipTo: z.string().min(1),
    }),
  ),
});

type QuestionValues = z.infer<typeof schema>;

const field =
  "rounded-lg border-muted-strong bg-surface text-foreground dark:border-border dark:bg-muted/40";

/** Writes a new question, with optional skip rules, onto the end of the sequence. */
export function QuestionDialog({
  questions,
  onAdd,
  trigger,
}: {
  /** The questions a rule can skip to. */
  questions: AssessmentQuestion[];
  onAdd: (question: AssessmentQuestion) => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionDialogContent className="max-w-168 bg-surface">
        {/* Mounted only while open, so every opening starts a fresh question. */}
        <QuestionForm
          questions={questions}
          onAdd={(question) => {
            onAdd(question);
            setOpen(false);
          }}
        />
      </ActionDialogContent>
    </Dialog>
  );
}

function QuestionForm({
  questions,
  onAdd,
}: {
  questions: AssessmentQuestion[];
  onAdd: (question: AssessmentQuestion) => void;
}) {
  const formId = useId();
  const form = useForm<QuestionValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: "", type: "scale", required: true, rules: [] },
  });
  const rules = useFieldArray({ control: form.control, name: "rules" });
  const targets = [
    ...questions.map((question, index) => ({ value: question.id, label: `Q${index + 1}` })),
    { value: "end", label: "End of Assessment" },
  ];

  const onSubmit = form.handleSubmit((values) =>
    onAdd({
      id: `q-${crypto.randomUUID()}`,
      text: values.text,
      type: values.type,
      required: values.required,
      // New questions start as drafts until the sequence is saved and published.
      status: "draft",
      rules: values.rules.map((rule) => ({ ...rule, id: crypto.randomUUID() })),
    }),
  );

  return (
    <>
      <ActionDialogHeader
        title="Add New Question"
        description={
          <span className="sr-only">Write the question, pick its type and add any skip rules.</span>
        }
        className="items-center bg-surface px-8 py-5 max-sm:px-5"
        titleClassName="text-[22px] leading-8 font-semibold"
      />
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-8 py-8 max-sm:px-5">
        <form id={formId} method="post" onSubmit={onSubmit} noValidate className="flex flex-col">
          <Controller
            name="text"
            control={form.control}
            render={({ field: text, fieldState }) => (
              <div className="flex flex-col gap-2.5">
                <label htmlFor={`${formId}-text`} className="text-base font-semibold tracking-wide">
                  Question Text{" "}
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </label>
                <Textarea
                  {...text}
                  id={`${formId}-text`}
                  placeholder="e.g., How many hours of sleep did you get last night?"
                  aria-invalid={fieldState.invalid}
                  aria-required
                  className={`${field} min-h-24 resize-none px-4 py-3 text-base placeholder:text-[#6b7280] md:text-lg`}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Controller
              name="type"
              control={form.control}
              render={({ field: type }) => (
                <div className="flex flex-col gap-2.5">
                  <span id={`${formId}-type`} className="text-base font-semibold tracking-wide">
                    Question Type
                  </span>
                  <Select
                    value={type.value}
                    onValueChange={(value) => type.onChange(value as QuestionType)}
                  >
                    <SelectTrigger
                      aria-labelledby={`${formId}-type`}
                      className={`${field} h-12 w-full px-4 text-lg data-[size=default]:h-12 [&_svg:not([class*='size-'])]:size-5`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.entries(QUESTION_TYPES).map(([value, option]) => (
                        <SelectItem key={value} value={value} className="py-2 text-sm">
                          {option.option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <Controller
              name="required"
              control={form.control}
              render={({ field: required }) => (
                <label
                  className={`${field} flex h-12 cursor-pointer items-center justify-between gap-4 self-end border px-4 text-base`}
                >
                  Mark as Required
                  <Switch
                    checked={required.value}
                    onCheckedChange={required.onChange}
                    className="h-7 w-12 data-[size=default]:h-7 data-[size=default]:w-12 data-checked:bg-action dark:data-checked:bg-primary [&_[data-slot=switch-thumb]]:size-6 [&_[data-slot=switch-thumb]]:data-checked:translate-x-[calc(100%-4px)]"
                  />
                </label>
              )}
            />
          </div>

          <hr className="my-8 border-muted-strong dark:border-border" />

          <h3 className="flex items-center gap-3 text-[22px] leading-7 font-semibold">
            <TreeStructureIcon
              aria-hidden
              weight="bold"
              className="size-6 text-action dark:text-primary"
            />
            Logic &amp; Branching
          </h3>
          <p className="mt-3 text-base text-muted-foreground">
            Configure conditional paths based on user responses to this question.
          </p>
          <div className="mt-5 rounded-lg bg-muted p-4 dark:bg-muted/50">
            {rules.fields.length === 0 && (
              <p className="px-2 pt-1 text-sm text-muted-foreground">
                No rules yet: everyone moves on to the next question.
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {rules.fields.map((rule, index) => (
                <li
                  key={rule.id}
                  className="flex flex-wrap items-center gap-2.5 rounded-md border border-muted-strong bg-surface p-4 sm:flex-nowrap dark:border-border dark:bg-muted/40"
                >
                  <span className="rounded bg-[#e0e3e6] px-2 py-1 text-xs font-semibold text-muted-foreground dark:bg-muted">
                    IF
                  </span>
                  <Controller
                    name={`rules.${index}.operator`}
                    control={form.control}
                    render={({ field: operator }) => (
                      <Select value={operator.value} onValueChange={operator.onChange}>
                        <SelectTrigger
                          aria-label={`Rule ${index + 1} condition`}
                          className="h-11 w-30 shrink-0 rounded-md border-border bg-transparent px-2 text-base data-[size=default]:h-11 max-sm:flex-1 [&_svg:not([class*='size-'])]:size-4.5"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {OPERATORS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-sm">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name={`rules.${index}.value`}
                    control={form.control}
                    render={({ field: value, fieldState }) => (
                      <Input
                        {...value}
                        aria-label={`Rule ${index + 1} answer`}
                        aria-invalid={fieldState.invalid}
                        placeholder="Value (e.g. Yes)"
                        className="h-11 w-32 min-w-0 rounded-md border-outline bg-transparent px-2 text-base placeholder:text-outline max-sm:w-full md:text-base"
                      />
                    )}
                  />
                  <span className="shrink-0 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Skip to
                  </span>
                  <Controller
                    name={`rules.${index}.skipTo`}
                    control={form.control}
                    render={({ field: skipTo }) => (
                      <Select value={skipTo.value} onValueChange={skipTo.onChange}>
                        <SelectTrigger
                          aria-label={`Rule ${index + 1} destination`}
                          className="h-auto min-h-11 w-34 shrink-0 rounded-md border-border bg-transparent px-2 py-1 text-left text-base leading-5 whitespace-normal data-[size=default]:h-auto *:data-[slot=select-value]:line-clamp-2 max-sm:min-w-0 max-sm:flex-1 [&_svg:not([class*='size-'])]:size-4.5"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {targets.map((target) => (
                            <SelectItem key={target.value} value={target.value} className="text-sm">
                              {target.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <button
                    type="button"
                    aria-label={`Remove rule ${index + 1}`}
                    onClick={() => rules.remove(index)}
                    className="ml-auto flex size-9 items-center justify-center rounded-md text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <TrashIcon aria-hidden weight="bold" className="size-5" />
                  </button>
                  <FieldError
                    errors={[form.formState.errors.rules?.[index]?.value]}
                    className="basis-full"
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => rules.append({ operator: "is", value: "", skipTo: "end" })}
              className="mt-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-action outline-none hover:bg-background/70 focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
            >
              <PlusIcon aria-hidden weight="bold" className="size-4" />
              Add Logic Rule
            </button>
          </div>
        </form>
      </div>
      <ActionDialogFooter className="bg-surface px-8 max-sm:px-5">
        <DialogPrimitive.Close className="h-14 rounded-lg border border-border bg-background px-8 text-lg font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1 max-sm:text-base">
          Cancel
        </DialogPrimitive.Close>
        <button
          type="submit"
          form={formId}
          className="h-14 rounded-lg bg-action-icon px-8 text-lg font-semibold tracking-wide text-white outline-none hover:bg-action-icon/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1 max-sm:text-base"
        >
          Save Question
        </button>
      </ActionDialogFooter>
    </>
  );
}
