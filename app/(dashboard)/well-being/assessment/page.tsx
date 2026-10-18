import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { AssessmentOverview } from "@/components/well-being/assessment-overview";
import { ManageQuestionsLink } from "@/components/well-being/wellbeing-actions";
import { WellbeingTabs } from "@/components/well-being/wellbeing-tabs";
import {
  SAMPLE_ASSESSMENT_FUNNEL,
  SAMPLE_ASSESSMENT_STATS,
  SAMPLE_QUESTIONS,
} from "@/constants/well-being-sample";

export const metadata: Metadata = { title: "Well-being Assessment" };

// UI only: the Figma's sample figures and questions; no assessment routes yet.
export default function WellbeingAssessmentPage() {
  return (
    <>
      <PageHeader
        title="Well-being"
        description="Manage and curate resources for user mental health and emotional well-being."
      >
        <ManageQuestionsLink />
      </PageHeader>
      <WellbeingTabs />
      <AssessmentOverview
        stats={SAMPLE_ASSESSMENT_STATS}
        funnel={SAMPLE_ASSESSMENT_FUNNEL}
        questions={SAMPLE_QUESTIONS}
      />
    </>
  );
}
