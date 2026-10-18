import { PlusIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { ToastButton } from "@/components/dashboard/toast-button";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { TeamSettings } from "@/components/settings/team-settings";
import {
  SAMPLE_ADMIN_TOTAL,
  SAMPLE_ADMINS,
  SAMPLE_ROLE_SUMMARIES,
} from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Team & Roles" };

// UI only: GET /admin/users/admins and PATCH /admin/users/{id}/role exist but aren't wired yet.
export default function TeamSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Team & Roles"
        description="Manage administrators and control what each team member can access."
      >
        <ToastButton
          message="Inviting admins isn't available yet"
          className="flex h-10 items-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <PlusIcon aria-hidden weight="bold" className="size-4.5" />
          Invite Admin
        </ToastButton>
      </SettingsSectionHeader>
      <TeamSettings
        admins={SAMPLE_ADMINS}
        total={SAMPLE_ADMIN_TOTAL}
        roles={SAMPLE_ROLE_SUMMARIES}
      />
    </>
  );
}
