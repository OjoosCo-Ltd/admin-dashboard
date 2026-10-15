import { cn } from "cn";
import type { ReactNode } from "react";

/** A section's title and description, with its actions (date range, export) beside them on wide screens. */
export function PageHeader({
  title,
  description,
  descriptionClassName,
  children,
}: {
  title: string;
  description: string;
  /** Where a Figma wraps the description at another width, e.g. "max-w-160". */
  descriptionClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
      <div className="min-w-0">
        <h1 className="text-[28px]/6 font-bold text-primary">{title}</h1>
        <p className={cn("mt-1 max-w-152 text-base text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      </div>
      {children && <div className="flex flex-wrap gap-3 xl:shrink-0">{children}</div>}
    </div>
  );
}
