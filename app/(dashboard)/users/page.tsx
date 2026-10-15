import type { Metadata } from "next";
import { Suspense } from "react";

import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { AgeDistributionCard } from "@/components/users/age-distribution-card";
import { GenderCard } from "@/components/users/gender-card";
import { GrowthTrendCard } from "@/components/users/growth-trend-card";
import { UsersDirectory, UsersDirectoryFallback } from "@/components/users/users-directory";
import {
  SAMPLE_AGE_BANDS,
  SAMPLE_GENDER_SPLIT,
  SAMPLE_USER_COUNT,
  SAMPLE_USER_KPIS,
  SAMPLE_USER_TOTALS,
  SAMPLE_USERS,
} from "@/constants/users-sample";

export const metadata: Metadata = { title: "Users" };

// UI only: every section renders the Figma's sample figures until GET
// /admin/users and the user stats are typed and wired.
export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage all registered users, monitor activity, review account status, and maintain a trusted community."
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <section
        aria-label="Key metrics"
        className="grid gap-6 min-[30rem]:grid-cols-2 lg:grid-cols-3 min-[90rem]:grid-cols-6"
      >
        {SAMPLE_USER_KPIS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <GrowthTrendCard data={SAMPLE_USER_TOTALS} className="md:col-span-2" />
        <GenderCard data={SAMPLE_GENDER_SPLIT} />
        <AgeDistributionCard bands={SAMPLE_AGE_BANDS} />
      </div>
      {/* The filters live in the URL; until it's read, the unfiltered list stands in. */}
      <Suspense
        fallback={<UsersDirectoryFallback users={SAMPLE_USERS} totalCount={SAMPLE_USER_COUNT} />}
      >
        <UsersDirectory users={SAMPLE_USERS} totalCount={SAMPLE_USER_COUNT} />
      </Suspense>
    </>
  );
}
