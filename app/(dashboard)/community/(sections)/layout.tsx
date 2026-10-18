import { CommunitySectionHeader } from "@/components/community/community-section-header";

/** The Community header and its Groups / Events / Moderation tabs, each tab its own page. */
export default function CommunitySectionsLayout({ children }: LayoutProps<"/community">) {
  return (
    <>
      <CommunitySectionHeader />
      {children}
    </>
  );
}
