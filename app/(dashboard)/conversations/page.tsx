import type { Metadata } from "next";
import { Suspense } from "react";

import { AiEngagementCard } from "@/components/conversations/ai-engagement-card";
import { ConversationActivityCard } from "@/components/conversations/conversation-activity-card";
import { ConversationHealthCard } from "@/components/conversations/conversation-health-card";
import { ConversationKpiRow } from "@/components/conversations/conversation-kpi-row";
import { ConversationTable } from "@/components/conversations/conversation-table";
import { PrivacyNotice } from "@/components/conversations/privacy-notice";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SAMPLE_AI_FEATURES,
  SAMPLE_CONVERSATION_ACTIVITY,
  SAMPLE_CONVERSATION_HEALTH,
  SAMPLE_CONVERSATION_KPIS,
  SAMPLE_CONVERSATION_TOTAL,
  SAMPLE_CONVERSATIONS,
} from "@/constants/conversations-sample";

export const metadata: Metadata = { title: "Conversations" };

// UI only: every section renders the Figma's sample figures until /admin/chat/*
// (libs/api/endpoints.ts) is typed and wired.
export default function ConversationsPage() {
  return (
    <>
      <PageHeader
        title="Conversations"
        description="Monitor conversation health, AI engagement, moderation alerts, and communication trends while protecting user privacy."
        descriptionClassName="max-w-160"
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <PrivacyNotice />
      <ConversationKpiRow kpis={SAMPLE_CONVERSATION_KPIS} />
      <div className="grid gap-6 xl:grid-cols-3">
        <ConversationActivityCard data={SAMPLE_CONVERSATION_ACTIVITY} className="xl:col-span-2" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 xl:content-start">
          <ConversationHealthCard data={SAMPLE_CONVERSATION_HEALTH} />
          <AiEngagementCard features={SAMPLE_AI_FEATURES} />
        </div>
      </div>
      {/* The table keeps its filters, page and open conversation in the URL. */}
      <Suspense fallback={<Skeleton className="h-95 rounded-xl" />}>
        <ConversationTable conversations={SAMPLE_CONVERSATIONS} total={SAMPLE_CONVERSATION_TOTAL} />
      </Suspense>
    </>
  );
}
