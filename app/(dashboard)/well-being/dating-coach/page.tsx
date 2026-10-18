import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import {
  ActiveCoachesCard,
  CoachKpiGrid,
  RecentSessionsCard,
} from "@/components/well-being/coach-overview";
import { CoachQuickActions } from "@/components/well-being/coach-quick-actions";
import { ServiceConfigCard } from "@/components/well-being/service-config-card";
import { ManageQuestionsLink } from "@/components/well-being/wellbeing-actions";
import { WellbeingTabs } from "@/components/well-being/wellbeing-tabs";
import {
  SAMPLE_COACH_AVAILABILITY,
  SAMPLE_COACH_KPIS,
  SAMPLE_COACH_SERVICE,
  SAMPLE_COACH_SESSIONS,
  SAMPLE_COACHES,
} from "@/constants/well-being-sample";

export const metadata: Metadata = { title: "Dating Coach" };

// UI only: the Figma's sample coaches and sessions; there are no coaching routes yet.
export default function DatingCoachPage() {
  const availabilityCoach =
    SAMPLE_COACHES.find((coach) => coach.id === SAMPLE_COACH_AVAILABILITY.coachId) ??
    SAMPLE_COACHES[0];
  return (
    <>
      <PageHeader
        title="Dating Coach Management"
        description="Configure services and monitor 1-on-1 coaching sessions."
      >
        <ManageQuestionsLink />
      </PageHeader>
      <WellbeingTabs />
      <CoachKpiGrid kpis={SAMPLE_COACH_KPIS} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ActiveCoachesCard coaches={SAMPLE_COACHES} />
          <RecentSessionsCard sessions={SAMPLE_COACH_SESSIONS} coaches={SAMPLE_COACHES} />
        </div>
        <div className="flex flex-col gap-6">
          <ServiceConfigCard initial={SAMPLE_COACH_SERVICE} />
          <CoachQuickActions coach={availabilityCoach} availability={SAMPLE_COACH_AVAILABILITY} />
        </div>
      </div>
    </>
  );
}
