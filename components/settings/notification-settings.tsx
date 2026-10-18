"use client";

import { EnvelopeSimpleIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import { SaveButton, SecondaryButton } from "@/components/settings/save-button";
import { SettingsCard } from "@/components/settings/settings-section";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreference } from "@/types/settings";

const CHANNELS: { channel: NotificationPreference["channel"]; title: string; icon: ReactNode }[] = [
  { channel: "email", title: "Email Notifications", icon: <EnvelopeSimpleIcon /> },
  { channel: "dashboard", title: "Admin Dashboard Notifications", icon: <SquaresFourIcon /> },
];

/** Which alerts reach the admin by email and in the dashboard. */
export function NotificationSettings({ initial }: { initial: NotificationPreference[] }) {
  const [preferences, setPreferences] = useState(initial);

  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        // UI only: there's no notification preferences endpoint yet.
        toast("Saving notification preferences isn't available yet");
      }}
    >
      <div className="grid items-stretch gap-6 md:grid-cols-2">
        {CHANNELS.map((group) => (
          <ChannelCard
            key={group.channel}
            title={group.title}
            icon={group.icon}
            preferences={preferences.filter((item) => item.channel === group.channel)}
            onToggle={(id, enabled) =>
              setPreferences((current) =>
                current.map((item) => (item.id === id ? { ...item, enabled } : item)),
              )
            }
          />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-end gap-4 border-t border-border/50 pt-6 dark:border-border">
        <SecondaryButton onClick={() => setPreferences(initial)} className="text-muted-foreground">
          Cancel Changes
        </SecondaryButton>
        <SaveButton className="font-normal tracking-normal">Save Preferences</SaveButton>
      </div>
    </form>
  );
}

function ChannelCard({
  title,
  icon,
  preferences,
  onToggle,
}: {
  title: string;
  icon: ReactNode;
  preferences: NotificationPreference[];
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const titleId = useId();
  return (
    <SettingsCard aria-labelledby={titleId} className="px-6 pt-6 pb-4">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4 dark:border-border">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info-soft text-[#45606c] dark:bg-action/25 dark:text-primary [&_svg]:size-6"
        >
          {icon}
        </span>
        <h3 id={titleId} className="text-xl leading-7 font-semibold">
          {title}
        </h3>
      </div>
      <ul className="mt-4 divide-y divide-border/40 dark:divide-border">
        {preferences.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-6 py-4">
            <div className="min-w-0">
              <p id={`${titleId}-${item.id}`} className="text-[13px] font-semibold tracking-wide">
                {item.title}
              </p>
              <p
                id={`${titleId}-${item.id}-hint`}
                className="mt-1 text-[13px] leading-[18px] text-muted-foreground"
              >
                {item.description}
              </p>
            </div>
            <Switch
              checked={item.enabled}
              onCheckedChange={(enabled) => onToggle(item.id, enabled)}
              aria-labelledby={`${titleId}-${item.id}`}
              aria-describedby={`${titleId}-${item.id}-hint`}
              className="mt-0.5 h-6 w-11 data-[size=default]:h-6 data-[size=default]:w-11 data-checked:bg-action dark:data-checked:bg-primary data-unchecked:bg-container [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-[calc(100%-2px)]"
            />
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}
