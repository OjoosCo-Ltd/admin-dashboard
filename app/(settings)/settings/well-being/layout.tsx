import { requireFeature } from "@/libs/feature-gate";

/** Well-being settings have no route yet. The route 404s until FEATURES.wellbeing is on. */
export default function WellbeingSettingsLayout({ children }: LayoutProps<"/settings/well-being">) {
  requireFeature("wellbeing");
  return children;
}
