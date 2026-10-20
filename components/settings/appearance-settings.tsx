"use client";

import { CheckCircleIcon, SidebarIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { SettingsCard } from "@/components/settings/settings-section";
import type { AppearancePreferences } from "@/types/settings";

type ThemeMode = "light" | "dark" | "system";

const THEME_MODES: { value: ThemeMode; label: string; preview: ReactNode }[] = [
  { value: "light", label: "Light", preview: <LightPreview /> },
  { value: "dark", label: "Dark", preview: <DarkPreview /> },
  { value: "system", label: "System Default", preview: <SystemPreview /> },
];

const DENSITIES: Option<AppearancePreferences["density"]>[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

const SIDEBAR_STYLES: Option<AppearancePreferences["sidebar"]>[] = [
  {
    value: "expanded",
    label: "Expanded",
    icon: <SidebarIcon aria-hidden weight="bold" className="size-3.5" />,
  },
  {
    value: "icons",
    label: "Icons only",
    icon: <SidebarSimpleIcon aria-hidden weight="bold" className="size-3.5" />,
  },
];

interface Option<T extends string> {
  value: T;
  label: string;
  /** Always shown. Without one, the group's `checkedIcon` marks the chosen option. */
  icon?: ReactNode;
}

const subscribeToNothing = () => () => {};

/** False in the server render and during hydration, true after: the theme is only known in the browser. */
function useMounted() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** Theme mode (real, through next-themes), then table density and sidebar style (UI only). */
export function AppearanceSettings({ initial }: { initial: AppearancePreferences }) {
  const [density, setDensity] = useState(initial.density);
  const [sidebar, setSidebar] = useState(initial.sidebar);

  return (
    <SettingsCard className="p-5 sm:p-8">
      <ThemeModeGroup />
      <hr className="mt-6 border-border/30 sm:mt-8 dark:border-border" />
      <OptionGroup
        title="Density"
        description="Adjust the spacing within data tables and lists."
        value={density}
        options={DENSITIES}
        checkedIcon={<CheckCircleIcon aria-hidden weight="bold" className="size-3.75" />}
        onChange={(value) => {
          setDensity(value);
          // UI only: nothing reads the density yet. One toast however often it changes.
          toast("Changing the density isn't available yet", { id: "appearance-density" });
        }}
      />
      <hr className="mt-6 border-border/30 sm:mt-8 dark:border-border" />
      <OptionGroup
        title="Sidebar Style"
        description="Choose how the main navigation is displayed."
        value={sidebar}
        options={SIDEBAR_STYLES}
        onChange={(value) => {
          setSidebar(value);
          // UI only: the sidebar has no icons-only mode yet.
          toast("Changing the sidebar style isn't available yet", { id: "appearance-sidebar" });
        }}
      />
    </SettingsCard>
  );
}

function ThemeModeGroup() {
  const titleId = useId();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div>
      <h3 id={titleId} className="text-xl leading-7 font-semibold">
        Theme Mode
      </h3>
      <RadioGroupPrimitive.Root
        aria-labelledby={titleId}
        // Nothing is chosen until mounted, so the server's render and the browser's agree.
        value={mounted ? (theme ?? "") : ""}
        onValueChange={setTheme}
        className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-6"
      >
        {THEME_MODES.map((mode) => (
          <RadioGroupPrimitive.Item
            key={mode.value}
            value={mode.value}
            className="group flex items-center gap-3 rounded-md border-2 border-transparent bg-surface p-2 text-left transition-colors outline-none hover:border-border/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=checked]:border-action sm:flex-col sm:items-stretch dark:bg-muted/50 dark:hover:border-border dark:data-[state=checked]:border-primary"
          >
            <span aria-hidden className="block h-16 w-26 shrink-0 sm:h-[131px] sm:w-auto">
              {mode.preview}
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3 px-2 sm:flex-none">
              <span className="text-xs leading-4 font-semibold tracking-wider text-muted-foreground group-data-[state=checked]:text-foreground">
                {mode.label}
              </span>
              <RadioDot />
            </span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

/** The ring and dot drawn in each theme card. The whole card is the radio. */
function RadioDot() {
  return (
    <span
      aria-hidden
      className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-border group-data-[state=checked]:border-action dark:border-muted-foreground/60 dark:group-data-[state=checked]:border-primary"
    >
      <span className="size-2 rounded-full bg-action opacity-0 group-data-[state=checked]:opacity-100 dark:bg-primary" />
    </span>
  );
}

function OptionGroup<T extends string>({
  title,
  description,
  value,
  options,
  checkedIcon,
  onChange,
}: {
  title: string;
  description: string;
  value: T;
  options: Option<T>[];
  checkedIcon?: ReactNode;
  onChange: (value: T) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div className="mt-8 sm:mt-12">
      <h3 id={titleId} className="text-xl leading-7 font-semibold">
        {title}
      </h3>
      <p id={descriptionId} className="mt-2 text-[13px] leading-[18px] text-muted-foreground">
        {description}
      </p>
      <RadioGroupPrimitive.Root
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:gap-4"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className="flex h-10.5 min-w-0 items-center justify-between gap-2 rounded-md border border-border/50 bg-card pr-3.5 pl-4 text-xs font-semibold tracking-wider text-muted-foreground transition-colors outline-none hover:border-border focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=checked]:border-action data-[state=checked]:text-action data-[state=checked]:shadow-xs max-sm:pr-2.5 max-sm:pl-3 sm:w-50 dark:border-input dark:bg-transparent dark:hover:border-muted-foreground/60 dark:data-[state=checked]:border-primary dark:data-[state=checked]:text-primary"
          >
            <span className="truncate">{option.label}</span>
            {option.icon ?? (option.value === value && checkedIcon)}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

// The Figma's window sketches (a top bar, a sidebar and a content panel), drawn in fixed
// light and dark colors so they read the same in either theme.
function LightPreview() {
  return (
    <span className="flex size-full flex-col gap-2 rounded-[4px] border border-[#f2f4f5] bg-white p-2 shadow-[0_1px_2px_rgb(24_28_30/0.06)] max-sm:gap-1.5 max-sm:p-1.5">
      <span className="h-2 shrink-0 rounded-full bg-muted-strong max-sm:h-1.5" />
      <span className="flex flex-1 gap-2 max-sm:gap-1.5">
        <span className="w-1/4 rounded-[4px] bg-container" />
        <span className="flex-1 rounded-[4px] border border-[#f5f6f8] bg-white" />
      </span>
    </span>
  );
}

function DarkPreview() {
  return (
    <span className="flex size-full flex-col gap-2 rounded-[4px] border border-[#3e4958] bg-[#1e293b] p-2 max-sm:gap-1.5 max-sm:p-1.5">
      <span className="h-2 shrink-0 rounded-full bg-[#334155] max-sm:h-1.5" />
      <span className="flex flex-1 gap-2 max-sm:gap-1.5">
        <span className="w-1/4 rounded-[4px] bg-[#0f172a]" />
        <span className="flex-1 rounded-[4px] border border-[#2e394a] bg-[#1e293b]" />
      </span>
    </span>
  );
}

function SystemPreview() {
  return (
    <span className="flex size-full overflow-hidden rounded-[4px] border border-[#eceff4] dark:border-[#3e4958]">
      <span className="flex flex-1 flex-col gap-2 bg-white p-2 max-sm:gap-1.5 max-sm:p-1.5">
        <span className="h-2 shrink-0 rounded-full bg-muted-strong max-sm:h-1.5" />
        <span className="flex-1 rounded-[4px] bg-container" />
      </span>
      <span className="flex flex-1 flex-col gap-2 bg-[#1e293b] p-2 max-sm:gap-1.5 max-sm:p-1.5">
        <span className="h-2 shrink-0 rounded-full bg-[#334155] max-sm:h-1.5" />
        <span className="flex-1 rounded-[4px] bg-[#0f172a]" />
      </span>
    </span>
  );
}
