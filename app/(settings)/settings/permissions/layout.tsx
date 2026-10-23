import { requireFeature } from "@/libs/feature-gate";

/** Role permissions have no route yet. The route 404s until FEATURES.rolePermissions is on. */
export default function PermissionsSettingsLayout({ children }: LayoutProps<"/settings/permissions">) {
  requireFeature("rolePermissions");
  return children;
}
