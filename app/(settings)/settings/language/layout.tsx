import { requireFeature } from "@/libs/feature-gate";

/** An admin's language and region have no route yet. The route 404s until FEATURES.adminPreferences is on. */
export default function LanguageSettingsLayout({ children }: LayoutProps<"/settings/language">) {
  requireFeature("adminPreferences");
  return children;
}
