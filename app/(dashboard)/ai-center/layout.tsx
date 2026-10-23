import { requireFeature } from "@/libs/feature-gate";

/** The AI Center has no AI metrics routes yet. The route 404s until FEATURES.aiMetrics is on. */
export default function AiCenterLayout({ children }: LayoutProps<"/ai-center">) {
  requireFeature("aiMetrics");
  return children;
}
