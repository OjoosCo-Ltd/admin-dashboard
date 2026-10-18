import type { Metadata } from "next";
import { Suspense } from "react";

import { AuditLogs, AuditLogsFallback } from "@/components/settings/audit-logs";
import { SAMPLE_AUDIT_LOG_TOTAL, SAMPLE_AUDIT_LOGS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  const props = { logs: SAMPLE_AUDIT_LOGS, totalCount: SAMPLE_AUDIT_LOG_TOTAL };
  return (
    <Suspense fallback={<AuditLogsFallback {...props} />}>
      <AuditLogs {...props} />
    </Suspense>
  );
}
