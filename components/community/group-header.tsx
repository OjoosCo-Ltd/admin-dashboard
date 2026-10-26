"use client";

import { GlobeHemisphereWestIcon, LockSimpleIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";

import { ON_INFO_SOFT } from "@/components/community/community-badges";
import { GroupFormDialog } from "@/components/community/group-form-dialog";
import { GROUP_GLYPHS } from "@/components/community/group-thumbnail";
import { SectionTabs } from "@/components/community/section-tabs";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/constants/features";
import type { CommunityGroup } from "@/types/community";

/** Overview, Members, Discussions and Reports: one page each under /community/groups/{id}. */
export function GroupTabs({ groupId }: { groupId: string }) {
  const base = `/community/groups/${groupId}`;
  return (
    <SectionTabs
      label="Group sections"
      tabs={[
        { label: "Overview", href: base },
        { label: "Members", href: `${base}/members`, feature: "groupMembers" },
        { label: "Discussions", href: `${base}/discussions` },
        { label: "Reports", href: `${base}/reports` },
      ]}
    />
  );
}

/**
 * The header on a group's Overview and Members: its glyph tile, name,
 * visibility and age, with Edit Group and Archive.
 */
export function GroupHeader({ group }: { group: CommunityGroup }) {
  const [editing, setEditing] = useState(false);
  const Glyph = GROUP_GLYPHS[group.glyph];
  const Privacy = group.privacy === "public" ? GlobeHemisphereWestIcon : LockSimpleIcon;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-6 max-sm:gap-4">
        <span
          aria-hidden
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-xl bg-info-soft dark:bg-info-soft/15",
            ON_INFO_SOFT,
          )}
        >
          <Glyph weight="fill" className="size-8" />
        </span>
        <div className="min-w-0">
          <h1 className="text-[28px]/9 font-bold text-primary">{group.name}</h1>
          <p className="flex items-center gap-1 text-[13px]/5 text-muted-foreground">
            {FEATURES.groupPrivacy && (
              <>
                <Privacy aria-hidden weight="fill" className="size-4 shrink-0" />
                {group.privacy === "public" ? "Public" : "Private"} Group
                <span aria-hidden>&bull;</span>
              </>
            )}
            Created {group.createdOn}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-3">
        <GroupFormDialog
          group={group}
          open={editing}
          onOpenChange={setEditing}
          trigger={
            <Button
              variant="outline"
              className="h-12 rounded-[12px] bg-surface px-6.5 text-sm font-normal text-subtle-foreground max-sm:flex-1 dark:bg-input/30"
            >
              Edit Group
            </Button>
          }
        />
        <Button
          // UI only: DELETE /admin/community/groups/{id} (with a reason) isn't wired.
          onClick={() => toast("Archiving groups isn't available yet")}
          className="h-12 rounded-[12px] bg-destructive-container px-6 text-base font-medium text-destructive hover:bg-destructive-container/80 max-sm:flex-1 dark:bg-destructive/20 dark:text-red-200"
        >
          Archive
        </Button>
      </div>
    </div>
  );
}

/** The header on a group's Discussions and Reports: the group as an eyebrow over the page's own title. */
export function GroupEyebrowHeader({ group, title }: { group: CommunityGroup; title: string }) {
  return (
    // -mb-1: the Figma sets the tabs a little closer to this shorter header.
    <div className="-mb-1">
      <p className="flex items-center gap-2 text-xs/4 font-medium tracking-wide text-muted-foreground uppercase">
        <UsersThreeIcon aria-hidden weight="fill" className="size-4" />
        {group.name} Community
      </p>
      <h1 className="text-[28px]/8 font-bold text-primary">{title}</h1>
    </div>
  );
}
