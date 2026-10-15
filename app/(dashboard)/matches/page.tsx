import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { EngagementFunnelCard } from "@/components/matches/engagement-funnel-card";
import { MatchActivityCard } from "@/components/matches/match-activity-card";
import { MatchReview } from "@/components/matches/match-review";
import { MatchesKpiRow } from "@/components/matches/matches-kpi-row";
import { ScoreDistributionCard } from "@/components/matches/score-distribution-card";
import {
  SAMPLE_ENGAGEMENT_FUNNEL,
  SAMPLE_HIGH_CONFIDENCE_MATCHES,
  SAMPLE_MATCH_ACTIVITY,
  SAMPLE_MATCH_COUNT,
  SAMPLE_MATCH_KPIS,
  SAMPLE_MATCHES,
  SAMPLE_SCORE_DISTRIBUTION,
} from "@/constants/matches-sample";

export const metadata: Metadata = { title: "Matches" };

// UI only: every section renders the Figma's sample figures until
// /admin/matching/* is typed and wired.
export default function MatchesPage() {
  return (
    <>
      <PageHeader
        title="Matches"
        description="Monitor AI-generated matches, track engagement, analyze compatibility performance, and identify relationship trends across the platform."
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <MatchesKpiRow kpis={SAMPLE_MATCH_KPIS} />
      <div className="grid gap-6 xl:grid-cols-3">
        <MatchActivityCard data={SAMPLE_MATCH_ACTIVITY} className="xl:col-span-2" />
        <EngagementFunnelCard stages={SAMPLE_ENGAGEMENT_FUNNEL} />
      </div>
      <MatchReview
        highConfidence={SAMPLE_HIGH_CONFIDENCE_MATCHES}
        matches={SAMPLE_MATCHES}
        totalCount={SAMPLE_MATCH_COUNT}
      >
        <ScoreDistributionCard data={SAMPLE_SCORE_DISTRIBUTION} />
      </MatchReview>
    </>
  );
}
