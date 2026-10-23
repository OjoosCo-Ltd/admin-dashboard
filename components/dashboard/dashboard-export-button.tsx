"use client";

import { useState } from "react";

import { ExportReportDialog } from "@/components/dashboard/export-report-dialog";
import { ExportReportButton } from "@/components/layout/page-header-actions";
import { FEATURES } from "@/constants/features";

/** The dashboard header's Export Report button and the dialog it opens. Hidden until there's an export route. */
export function DashboardExportButton() {
  return FEATURES.exports ? <DashboardExport /> : null;
}

function DashboardExport() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ExportReportButton onClick={() => setOpen(true)} />
      <ExportReportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
