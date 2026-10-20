import { BellSimpleIcon, CaretRightIcon, GlobeIcon, PaletteIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";

// Each preference is edited in its Settings section; these rows lead there.
const PREFERENCES = [
  { href: "/settings/notifications", label: "Notifications", Icon: BellSimpleIcon },
  { href: "/settings/appearance", label: "Appearance", Icon: PaletteIcon },
  { href: "/settings/language", label: "Language", Icon: GlobeIcon },
];

const glyph = "shrink-0 text-[#bfc8ce] dark:text-muted-foreground/70";

/** Shortcuts to the admin's notification, appearance and language settings. */
export function ProfilePreferencesCard() {
  return (
    <DashboardCard className="border-border/30 shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border">
      <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase">Preferences</h2>
      <ul className="mt-3">
        {PREFERENCES.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-12 items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icon aria-hidden weight="bold" className={`size-6 ${glyph}`} />
              <span className="min-w-0 flex-1">{label}</span>
              <CaretRightIcon aria-hidden weight="bold" className={`size-3 ${glyph}`} />
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
