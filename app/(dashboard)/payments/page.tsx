import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { FinancialInsightsCard } from "@/components/payments/financial-insights-card";
import { PaymentKpiRow } from "@/components/payments/payment-kpi-row";
import { RevenueOverviewCard } from "@/components/payments/revenue-overview-card";
import {
  TransactionTable,
  TransactionTableFallback,
} from "@/components/payments/transaction-table";
import {
  SAMPLE_FINANCIAL_INSIGHTS,
  SAMPLE_PAYMENT_KPIS,
  SAMPLE_REVENUE,
  SAMPLE_TRANSACTION_TOTAL,
  SAMPLE_TRANSACTIONS,
} from "@/constants/payments-sample";

export const metadata: Metadata = { title: "Payments" };

// UI only: every section renders the Figma's sample figures. The backend has
// no payment, transaction or revenue routes yet.
export default function PaymentsPage() {
  const table = { transactions: SAMPLE_TRANSACTIONS, total: SAMPLE_TRANSACTION_TOTAL };
  return (
    <>
      <PageHeader
        title="Payments"
        description="Monitor transactions, revenue, refunds, failed payments, and financial activity across Xparience."
        // Wide enough that the first line ends on "across", as the Figma's does at 1440.
        descriptionClassName="max-w-162"
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <PaymentKpiRow kpis={SAMPLE_PAYMENT_KPIS} />
      <div className="grid gap-6 xl:grid-cols-12">
        <RevenueOverviewCard data={SAMPLE_REVENUE} className="xl:col-span-8" />
        <FinancialInsightsCard insights={SAMPLE_FINANCIAL_INSIGHTS} className="xl:col-span-4" />
      </div>
      {/* The table keeps its filters, page and open transaction in the URL. */}
      <Suspense fallback={<TransactionTableFallback {...table} />}>
        <TransactionTable {...table} />
      </Suspense>
    </>
  );
}
