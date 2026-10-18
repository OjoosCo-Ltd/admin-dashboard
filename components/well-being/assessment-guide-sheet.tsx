"use client";

import { ChartBarIcon, ListChecksIcon, ScalesIcon, type Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  ActionDialogBody,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { PsychologyIcon } from "@/components/icons/app-icons";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const PRACTICES = [
  "Avoid double-barreled questions (asking two things at once).",
  "Use clear, unambiguous language suitable for an 8th-grade reading level.",
  "Ensure mutually exclusive and exhaustive response options for multiple-choice items.",
  "Balance positive and negative wording to mitigate response sets.",
];

const BIASES = [
  {
    title: "Cultural and Linguistic Fairness",
    body: "Review all items to ensure they do not assume specific cultural knowledge or use idioms that may alienate subgroups of respondents.",
  },
  {
    title: "Social Desirability Bias",
    body: "Frame sensitive questions neutrally. Utilize forced-choice formats where appropriate to reduce the tendency of respondents to answer in a manner viewed favorably by others.",
  },
];

const SCALES = [
  { type: "Likert (5-point)", use: "Attitude and frequency measurement." },
  { type: "Dichotomous", use: "Factual or behavioral confirmation." },
  { type: "Semantic Differential", use: "Evaluating connotative meaning of concepts." },
];

/** Reference notes on writing, de-biasing and scoring assessment questions. */
export function AssessmentGuideSheet({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionSheetContent className="max-w-112">
        <ActionDialogHeader
          icon={<PsychologyIcon className="h-4 w-auto" />}
          iconClassName="mt-1 size-7 rounded-full bg-[#cee0ea] text-action dark:bg-action/30 dark:text-primary"
          title="Psychological Assessment Guide"
          description={
            <span className="sr-only">
              Best practices for writing, de-biasing and scoring assessment questions.
            </span>
          }
          className="bg-surface px-10 py-6 max-sm:px-5"
          titleClassName="text-2xl leading-8 font-semibold max-sm:text-[22px] max-sm:leading-7"
        />
        <ActionDialogBody className="flex flex-col gap-16 px-10 py-10 max-sm:px-5">
          <GuideSection icon={ListChecksIcon} title="Best Practices for Question Structure">
            <p className="text-sm leading-5 text-muted-foreground">
              Constructing valid assessment items requires clarity and singular focus to ensure
              reliability.
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-[13px] leading-[18px] text-muted-foreground">
              {PRACTICES.map((practice) => (
                <li key={practice} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-action-icon"
                  />
                  {practice}
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection icon={ScalesIcon} title="Avoiding Bias">
            <div className="flex flex-col gap-4">
              {BIASES.map((bias) => (
                <div
                  key={bias.title}
                  className="rounded-lg border border-[#e3e7eb] bg-muted px-6 py-6 dark:border-border"
                >
                  <h4 className="text-sm leading-5 font-semibold">{bias.title}</h4>
                  <p className="mt-1.5 text-[13px] leading-[18px] text-muted-foreground">
                    {bias.body}
                  </p>
                </div>
              ))}
            </div>
          </GuideSection>

          <GuideSection icon={ChartBarIcon} title="Scoring Model Documentation">
            <p className="text-sm leading-5 text-muted-foreground">
              Adhere to the standard psychometric models defined in the organization&apos;s charter.
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-[#eceff0] dark:border-border">
              <table className="w-full text-left text-[13px] leading-[18px]">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="w-[44%] px-6 py-4 font-semibold tracking-wide">
                      Scale Type
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold tracking-wide">
                      Recommended Use
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SCALES.map((scale) => (
                    <tr key={scale.type} className="border-t border-[#eceff0] dark:border-border">
                      <th scope="row" className="px-6 py-4 font-medium">
                        {scale.type}
                      </th>
                      <td className="px-6 py-4 text-muted-foreground">{scale.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GuideSection>
        </ActionDialogBody>
        <ActionDialogFooter className="bg-surface px-6 py-5">
          {/* UI only: there's no PDF of the guide yet. */}
          <button
            type="button"
            onClick={() => toast("The guide PDF isn't available yet")}
            className="h-10.5 rounded-lg border border-border bg-background px-7 text-sm font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Download PDF
          </button>
        </ActionDialogFooter>
      </ActionSheetContent>
    </Dialog>
  );
}

function GuideSection({
  icon: Glyph,
  title,
  children,
}: {
  icon: Icon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-5 flex items-start gap-3 border-b border-[#f2f4f5] pb-2 text-xl leading-7 font-semibold text-review dark:border-border dark:text-subtle-foreground">
        <Glyph aria-hidden weight="bold" className="mt-1 size-5 shrink-0 text-action-icon" />
        {title}
      </h3>
      {children}
    </section>
  );
}
