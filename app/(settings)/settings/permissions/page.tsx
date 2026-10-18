import type { Metadata } from "next";

import { PermissionsSettings } from "@/components/settings/permissions-settings";
import { SAMPLE_PERMISSION_MODULE_TOTAL, SAMPLE_PERMISSIONS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Permissions" };

// Opens on Admin: the Figma's grid has restricted cells, which only make sense below Super Admin.
export default function PermissionsSettingsPage() {
  return (
    <PermissionsSettings
      initial={SAMPLE_PERMISSIONS}
      defaultRole="admin"
      moduleTotal={SAMPLE_PERMISSION_MODULE_TOTAL}
    />
  );
}
