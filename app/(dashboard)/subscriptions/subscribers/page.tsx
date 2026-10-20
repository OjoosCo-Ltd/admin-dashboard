import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ExportReportButton } from "@/components/layout/page-header-actions";
import {
  SubscriberDirectory,
  SubscriberDirectoryFallback,
} from "@/components/subscriptions/subscriber-directory";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SAMPLE_SUBSCRIBER_TOTAL, SAMPLE_SUBSCRIPTIONS } from "@/constants/subscriptions-sample";

export const metadata: Metadata = { title: "Subscribers" };

const count = new Intl.NumberFormat("en-GB");

// UI only: one sample page of subscribers, filtered in the browser.
export default function SubscribersPage() {
  const directory = { subscriptions: SAMPLE_SUBSCRIPTIONS, total: SAMPLE_SUBSCRIBER_TOTAL };
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Breadcrumb>
          <BreadcrumbList className="gap-1 text-sm text-muted-foreground sm:gap-1">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/subscriptions">Subscriptions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-muted-foreground">Directory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeader
          title="Subscribers"
          description={`Manage and view all ${count.format(SAMPLE_SUBSCRIBER_TOTAL)} subscriber records.`}
          descriptionClassName="max-w-none"
        >
          <ExportReportButton />
        </PageHeader>
      </div>
      {/* The filters, layout, page and open subscription live in the URL. */}
      <Suspense fallback={<SubscriberDirectoryFallback {...directory} />}>
        <SubscriberDirectory {...directory} />
      </Suspense>
    </>
  );
}
