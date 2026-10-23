import { requireFeature } from "@/libs/feature-gate";

/** Community settings have no route yet. The route 404s until FEATURES.communitySettings is on. */
export default function CommunitySettingsLayout({ children }: LayoutProps<"/settings/community">) {
  requireFeature("communitySettings");
  return children;
}
