import { CaretRightIcon, EyeIcon, FloppyDiskIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NotYetButton } from "@/components/well-being/wellbeing-actions";
import { QuestionBuilder } from "@/components/well-being/question-builder";
import { WellbeingTabs } from "@/components/well-being/wellbeing-tabs";
import { SAMPLE_ASSESSMENT_SETTINGS, SAMPLE_QUESTIONS } from "@/constants/well-being-sample";

export const metadata: Metadata = { title: "Manage Assessment Questions" };

// UI only: edits stay in the page; there's no assessment endpoint to save to yet.
export default function ManageQuestionsPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="-mb-4 text-base">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/well-being/assessment"
              className="rounded-sm text-outline outline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Assessment
            </Link>
          </li>
          <li aria-hidden>
            <CaretRightIcon weight="bold" className="size-3.5 text-outline" />
          </li>
          <li aria-current="page" className="text-foreground">
            Manage Questions
          </li>
        </ol>
      </nav>
      <PageHeader
        title="Manage Assessment Questions"
        description="Curate the well-being journey by managing the order, content, and logic of assessment questions."
        descriptionClassName="max-w-148"
      >
        <NotYetButton
          message="Previewing the assessment isn't available yet"
          className="border border-border bg-transparent text-subtle-foreground hover:bg-muted"
        >
          <EyeIcon aria-hidden weight="bold" className="size-6" />
          Preview Assessment
        </NotYetButton>
        <NotYetButton
          message="Saving questions isn't available yet"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <FloppyDiskIcon aria-hidden weight="bold" className="size-5" />
          Save Changes
        </NotYetButton>
      </PageHeader>
      <WellbeingTabs />
      <QuestionBuilder
        initialQuestions={SAMPLE_QUESTIONS}
        initialSettings={SAMPLE_ASSESSMENT_SETTINGS}
      />
    </>
  );
}
