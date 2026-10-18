"use client";

import { usePathname } from "next/navigation";

import {
  CreateEventButton,
  GroupsHeaderActions,
} from "@/components/community/community-header-actions";
import { SectionTabs } from "@/components/community/section-tabs";
import { PageHeader } from "@/components/layout/page-header";

const TABS = [
  { label: "Groups", href: "/community" },
  { label: "Events", href: "/community/events" },
  { label: "Moderation", href: "/community/moderation" },
];

/** Each tab's own title, description and actions, as its Figma sets them. */
const HEADERS = {
  "/community/events": {
    title: "Community Events",
    description: "Create and manage events available to Xparience community members.",
    actions: <CreateEventButton />,
  },
  "/community/moderation": {
    title: "Community Management",
    // The Figma repeats the Events description here; this one fits the queue.
    description: "Review reports and flagged content from across Xparience communities.",
    actions: null,
  },
};

const GROUPS = {
  title: "Community",
  description: "Manage community groups, events, participation, and discussions across Xparience.",
  actions: <GroupsHeaderActions />,
};

/** The Community section's header and its Groups / Events / Moderation tabs. */
export function CommunitySectionHeader() {
  const pathname = usePathname();
  const header = HEADERS[pathname as keyof typeof HEADERS] ?? GROUPS;
  return (
    <>
      <PageHeader
        title={header.title}
        description={header.description}
        descriptionClassName="max-w-162"
      >
        {header.actions}
      </PageHeader>
      <SectionTabs tabs={TABS} label="Community sections" />
    </>
  );
}
