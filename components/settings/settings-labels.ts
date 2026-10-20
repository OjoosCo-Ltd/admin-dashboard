import type { AdminRole, AdminStatus, AuditResult } from "@/types/settings";

/** Short role names, for pills and menus. */
export const ROLE_LABELS: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
  support: "Support",
};

/** Full role titles, where there's room (Profile's Account Details). */
export const ROLE_TITLES: Record<AdminRole, string> = {
  "super-admin": "Super Administrator",
  admin: "Administrator",
  moderator: "Moderator",
  support: "Support Agent",
};

export const ADMIN_STATUS: Record<AdminStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "text-action dark:text-primary" },
  pending: { label: "Pending", className: "text-[#a26727] dark:text-[#e9b97c]" },
  suspended: { label: "Suspended", className: "text-destructive" },
};

export const AUDIT_RESULT: Record<AuditResult, { label: string; className: string; dot: string }> =
  {
    success: {
      label: "Success",
      className:
        "border-[#ceead6] bg-[#e6f4ea] text-[#137333] dark:border-success/30 dark:bg-success/15 dark:text-success",
      dot: "bg-[#1e8e3e]",
    },
    failed: {
      label: "Failed",
      className:
        "border-[#fad2cf] bg-[#fce8e6] text-[#c5221f] dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive",
      dot: "bg-[#d93025]",
    },
    warning: {
      label: "Warning",
      className:
        "border-[#feefc3] bg-[#fef7e0] text-[#b06000] dark:border-[#e9b97c]/30 dark:bg-[#e9b97c]/15 dark:text-[#e9b97c]",
      dot: "bg-[#f29900]",
    },
  };

/** Initials for an avatar fallback: "Elena Rodriguez" → "ER". */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
