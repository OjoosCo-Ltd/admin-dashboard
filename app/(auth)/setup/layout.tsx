import { requireFeature } from "@/libs/feature-gate";

/** There's no setup-link route yet. The route 404s until FEATURES.adminInvites is on. */
export default function SetupLayout({ children }: LayoutProps<"/setup">) {
  requireFeature("adminInvites");
  return children;
}
