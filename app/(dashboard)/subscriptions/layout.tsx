import { requireFeature } from "@/libs/feature-gate";

/** Subscriptions has no backend routes yet. The route 404s until FEATURES.subscriptions is on. */
export default function SubscriptionsLayout({ children }: LayoutProps<"/subscriptions">) {
  requireFeature("subscriptions");
  return children;
}
