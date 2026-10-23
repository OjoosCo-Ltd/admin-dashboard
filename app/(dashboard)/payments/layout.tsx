import { requireFeature } from "@/libs/feature-gate";

/** Payments has no backend routes yet. The route 404s until FEATURES.payments is on. */
export default function PaymentsLayout({ children }: LayoutProps<"/payments">) {
  requireFeature("payments");
  return children;
}
