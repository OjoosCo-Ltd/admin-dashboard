import { XIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { SettingsNav } from "@/components/settings/settings-nav";
import { FEATURES } from "@/constants/features";

export const metadata: Metadata = { title: { template: "%s · Settings", default: "Settings" } };

// Names only the sections on show: Notifications waits on its preferences route.
const TOPICS = [
  "your administrator account",
  "security",
  "team access",
  FEATURES.notificationPreferences && "notifications",
  "Xparience platform configuration",
].filter((topic) => typeof topic === "string");

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-308 px-4 pt-6 pb-16 md:px-6 lg:pt-10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[32px] leading-10 font-bold tracking-tight max-sm:text-[28px] max-sm:leading-9">
            Settings
          </h1>
          <p className="mt-2 text-base leading-6 text-muted-foreground">
            Manage {new Intl.ListFormat("en-US").format(TOPICS)}.
          </p>
        </div>
        <Link
          href="/dashboard"
          aria-label="Close settings"
          className="mr-0.5 flex size-11 shrink-0 items-center justify-center self-start rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 lg:self-center"
        >
          <XIcon aria-hidden weight="light" className="size-10" />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
