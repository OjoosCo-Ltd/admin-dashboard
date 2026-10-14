import { InfoIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

/** The white card of the centered auth screens (invitation, password recovery). */
export function AuthCard({
  size = "default",
  className,
  ...props
}: ComponentProps<"div"> & {
  /** default is 480px (recovery screens), wide 560px (invitation). */
  size?: "default" | "wide";
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border bg-card p-6 text-card-foreground shadow-xs sm:p-10",
        size === "wide" ? "max-w-140" : "max-w-120",
        className,
      )}
      {...props}
    />
  );
}

/** Eyebrow, title and lead paragraph that open every auth screen. */
export function AuthHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {eyebrow && (
        <p className="mb-6 text-[13px] leading-4 font-semibold tracking-wide text-primary uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[30px] leading-9 font-semibold">{title}</h1>
      {description && (
        <p className="mt-5 text-[15px] leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/** Rounded icon tile above a status message. */
export function AuthStatusIcon({
  tone = "primary",
  children,
}: {
  tone?: "primary" | "success";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex size-12 items-center justify-center rounded-xl [&_svg:not([class*='size-'])]:size-6",
        tone === "success" ? "bg-success/10 text-success" : "bg-accent text-primary",
      )}
    >
      {children}
    </div>
  );
}

/** Tinted callout with an info icon, e.g. "Restricted initial setup". */
export function AuthNotice({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-lg bg-accent p-4", className)}>
      <InfoIcon aria-hidden className="mt-px size-5 shrink-0 text-primary" />
      <div className="text-[13px] leading-5 text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {children && <p className="mt-0.5">{children}</p>}
      </div>
    </div>
  );
}
