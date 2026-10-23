import { requireFeature } from "@/libs/feature-gate";

/** There's no invitation route yet. The route 404s until FEATURES.adminInvites is on. */
export default function InviteLayout({ children }: LayoutProps<"/invite">) {
  requireFeature("adminInvites");
  return children;
}
