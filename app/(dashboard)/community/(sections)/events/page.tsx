import type { Metadata } from "next";
import { Suspense } from "react";

import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { EventTable, EventTableFallback } from "@/components/community/event-table";
import { SAMPLE_EVENT_KPIS, SAMPLE_EVENT_TOTAL, SAMPLE_EVENTS } from "@/constants/community-sample";

export const metadata: Metadata = { title: "Community Events" };

// UI only: the backend has member-side event routes (/community/events) but no
// admin ones, so the tab renders the Figma's sample figures.
export default function CommunityEventsPage() {
  return (
    <>
      <CommunityKpiRow kpis={SAMPLE_EVENT_KPIS} />
      {/* The table keeps its filters, page and open event in the URL. */}
      <Suspense fallback={<EventTableFallback events={SAMPLE_EVENTS} total={SAMPLE_EVENT_TOTAL} />}>
        <EventTable events={SAMPLE_EVENTS} total={SAMPLE_EVENT_TOTAL} />
      </Suspense>
    </>
  );
}
