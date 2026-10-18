import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import {
  ResourcesDirectory,
  ResourcesDirectoryFallback,
} from "@/components/well-being/resources-directory";
import { CreateResourceLink } from "@/components/well-being/wellbeing-actions";
import { WellbeingTabs } from "@/components/well-being/wellbeing-tabs";
import { SAMPLE_RESOURCE_COUNT, SAMPLE_RESOURCES } from "@/constants/well-being-sample";

export const metadata: Metadata = { title: "Well-being Resources" };

// UI only: the Figma's sample library; the backend has no resource routes yet.
export default function WellbeingResourcesPage() {
  return (
    <>
      <PageHeader
        title="Well-being"
        description="Manage and curate resources for user mental health and emotional well-being."
      >
        <CreateResourceLink />
      </PageHeader>
      <WellbeingTabs />
      {/* The filters live in the URL; until it's read, the unfiltered list stands in. */}
      <Suspense
        fallback={
          <ResourcesDirectoryFallback
            resources={SAMPLE_RESOURCES}
            totalCount={SAMPLE_RESOURCE_COUNT}
          />
        }
      >
        <ResourcesDirectory resources={SAMPLE_RESOURCES} totalCount={SAMPLE_RESOURCE_COUNT} />
      </Suspense>
    </>
  );
}
