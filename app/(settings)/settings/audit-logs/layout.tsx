import { requireFeature } from "@/libs/feature-gate";

/** There's no audit log route yet. The route 404s until FEATURES.auditLog is on. */
export default function AuditLogsLayout({ children }: LayoutProps<"/settings/audit-logs">) {
  requireFeature("auditLog");
  return children;
}
