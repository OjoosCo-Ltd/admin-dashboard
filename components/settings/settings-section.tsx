import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

/** A settings section's title and description, with its actions on the right. */
export function SettingsSectionHeader({
  title,
  description,
  descriptionClassName,
  children,
}: {
  title: string;
  description: string;
  descriptionClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 lg:mb-10">
      <div className="min-w-0 flex-1 basis-80">
        <h2 className="text-xl leading-7 font-semibold tracking-tight">{title}</h2>
        <p className={cn("mt-1.5 text-base leading-6 text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/** The white, lightly outlined card the settings sections are built from. */
export function SettingsCard({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/40 bg-card text-card-foreground shadow-[0_1px_3px_rgb(24_28_30/0.04)] dark:border-border",
        className,
      )}
      {...props}
    />
  );
}
