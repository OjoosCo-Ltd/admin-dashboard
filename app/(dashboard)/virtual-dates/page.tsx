import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { DateActivityCard } from "@/components/virtual-dates/date-activity-card";
import { DateInsightsCard } from "@/components/virtual-dates/date-insights-card";
import { DateKpiGrid } from "@/components/virtual-dates/date-kpi-grid";
import {
  DateScheduleCard,
  DateScheduleFallback,
} from "@/components/virtual-dates/date-schedule-card";
import { DateThemesCard } from "@/components/virtual-dates/date-themes-card";
import { SatisfactionCard } from "@/components/virtual-dates/satisfaction-card";
import { SessionStatusCard } from "@/components/virtual-dates/session-status-card";
import { enabled, FEATURES, type Feature } from "@/constants/features";
import {
  SAMPLE_DATE_ACTIVITY,
  SAMPLE_DATE_INSIGHTS,
  SAMPLE_DATE_KPIS,
  SAMPLE_DATE_SESSIONS,
  SAMPLE_DATE_THEMES,
  SAMPLE_SATISFACTION,
  SAMPLE_SESSION_COUNT,
  SAMPLE_SESSION_STATUS,
} from "@/constants/virtual-dates-sample";

export const metadata: Metadata = { title: "Virtual Dates" };

// The description names only what the page shows.
const TOPICS = enabled<{ label: string; feature?: Feature }>([
  { label: "bookings" },
  { label: "attendance", feature: "dateAttendance" },
  { label: "engagement" },
  { label: "ratings" },
  { label: "moderation" },
  { label: "revenue", feature: "payments" },
]).map((topic) => topic.label);

// UI only: every section renders the Figma's sample figures until
// /admin/virtual-dates and its stats are typed and wired.
export default function VirtualDatesPage() {
  return (
    <>
      <PageHeader
        title="Virtual Dates"
        description={`Monitor ${new Intl.ListFormat("en-US").format(TOPICS)} from virtual date experiences.`}
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <DateKpiGrid kpis={SAMPLE_DATE_KPIS} />
      <div className="grid gap-6 xl:grid-cols-3">
        <DateActivityCard data={SAMPLE_DATE_ACTIVITY} className="xl:col-span-2" />
        <SessionStatusCard data={SAMPLE_SESSION_STATUS} />
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <DateThemesCard themes={SAMPLE_DATE_THEMES} className="xl:col-span-5" />
        <div className="flex flex-col gap-6 xl:col-span-7">
          {FEATURES.insights && <DateInsightsCard insights={SAMPLE_DATE_INSIGHTS} />}
          <SatisfactionCard data={SAMPLE_SATISFACTION} className="flex-1" />
        </div>
      </div>
      {/* The table's filter lives in the URL; until it's read, the first page stands in. */}
      <Suspense
        fallback={
          <DateScheduleFallback sessions={SAMPLE_DATE_SESSIONS} totalCount={SAMPLE_SESSION_COUNT} />
        }
      >
        <DateScheduleCard sessions={SAMPLE_DATE_SESSIONS} totalCount={SAMPLE_SESSION_COUNT} />
      </Suspense>
    </>
  );
}
