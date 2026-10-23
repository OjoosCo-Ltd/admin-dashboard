import { requireFeature } from "@/libs/feature-gate";

/** Well-being has no backend routes yet. The route 404s until FEATURES.wellbeing is on. */
export default function WellbeingLayout({ children }: LayoutProps<"/well-being">) {
  requireFeature("wellbeing");
  return children;
}
