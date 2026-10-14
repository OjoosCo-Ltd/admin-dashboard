import { cn } from "cn";
import Image from "next/image";

import {
  SettingsGearIcon,
  ShieldCheckOutlineIcon,
  StatsChartIcon,
  UsersGroupIcon,
  VerifiedShieldIcon,
} from "@/components/auth/auth-icons";
import { Logo } from "@/components/layout/logo";
import dashboardMockup from "@/public/images/auth/dashboard-mockup.png";

const FEATURES = [
  {
    icon: UsersGroupIcon,
    title: "User management",
    description: "Keep your community safe and engaged",
  },
  {
    icon: VerifiedShieldIcon,
    title: "Safety & moderation",
    description: "Protect and maintain a positive environment",
  },
  {
    icon: StatsChartIcon,
    title: "Business insights",
    description: "Track growth, engagement and revenue",
  },
  {
    icon: SettingsGearIcon,
    title: "Platform control",
    description: "Configure settings and manage operations",
  },
];

/**
 * The dark brand half of the split auth screens (login, setup). Hidden below
 * lg. It never scrolls, so its vertical gaps are the 960px-tall frame's at
 * that height and shrink on shorter screens to keep the footer line in view.
 */
export function BrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative hidden overflow-hidden bg-linear-to-b from-brand-800 to-brand-900 px-14 py-[clamp(2rem,5.8svh,3.5rem)] text-white lg:block",
        className,
      )}
    >
      <Logo className="h-10" />
      <div className="relative z-10 mt-[clamp(2rem,9.2svh,5.5rem)] max-w-117.5">
        <p className="text-[38px] leading-[1.13] font-semibold tracking-[-0.02em] xl:text-[46px]">
          Better connections.
          <span className="block text-brand-sky">A healthier tomorrow.</span>
        </p>
        <p className="mt-4 max-w-113 text-[17px] leading-6.5 text-white/80">
          Manage users, monitor engagement, ensure safety, and keep Xparience running smoothly - all
          from your admin dashboard
        </p>
        <ul className="mt-[clamp(1.75rem,5.8svh,3.5rem)] flex flex-col gap-[clamp(1.25rem,3.5svh,2.125rem)]">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-2">
              <Icon className="size-6 shrink-0 text-[#dbeff1]" />
              <div>
                <p className="leading-5.5 font-semibold text-brand-sky">{title}</p>
                <p className="text-xs leading-4.5 text-white/60">{description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-[clamp(1.75rem,8.3svh,5rem)] flex items-center gap-2 text-xs text-[#dbeff1]">
          <ShieldCheckOutlineIcon className="size-4 text-[#b8ced5]" />
          Built for responsible platform administration
        </p>
      </div>
      {/*
        The export is cropped at the laptop's right edge, so it hugs the panel's.
        From 1440px it sits where the Figma has it; narrower panels push the
        laptop into the paragraph, so it drops below the copy until then.
      */}
      <Image
        src={dashboardMockup}
        alt=""
        loading="eager"
        sizes="30vw"
        className="pointer-events-none absolute top-93 right-0 hidden w-[56%] max-w-none min-[1440px]:top-64.25 xl:block"
      />
    </aside>
  );
}
