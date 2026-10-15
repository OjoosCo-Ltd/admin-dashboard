"use client";

import { useState } from "react";

import { ExportReportDialog } from "@/components/dashboard/export-report-dialog";
import { ExportReportButton } from "@/components/layout/page-header-actions";

/** The dashboard header's Export Report button and the dialog it opens. */
export function DashboardExportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ExportReportButton onClick={() => setOpen(true)} />
      <ExportReportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
