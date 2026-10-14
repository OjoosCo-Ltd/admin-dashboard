import { LockIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// The auth screens are roomier than shadcn's defaults: 50px fields, a
// full-width 50px primary button, 22px between fields. Field text is the
// Figma's 15px from md; below that it stays 16px, because iOS Safari zooms
// the page into any focused input smaller than that.

/** FieldGroup with the Figma's 22px between fields. */
export function AuthFieldGroup({ className, ...props }: ComponentProps<typeof FieldGroup>) {
  return <FieldGroup className={cn("gap-5.5", className)} {...props} />;
}

export function AuthInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-12.5 rounded-md px-3.5 text-base md:text-[15px]", className)}
      {...props}
    />
  );
}

/** A value fixed by the backend (an invited email, an assigned role). Focusable but read-only. */
export function LockedInput({
  className,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "readOnly">) {
  return (
    <InputGroup className={cn("h-12.5 rounded-md bg-muted", className)}>
      {/* h-full: the group's padding strips above and below the input don't focus it on click. */}
      <InputGroupInput readOnly className="h-full pl-3.5 text-base md:text-[15px]" {...props} />
      <InputGroupAddon align="inline-end" className="pr-3.5">
        <LockIcon aria-hidden className="size-5" />
      </InputGroupAddon>
    </InputGroup>
  );
}

/** 20px checkbox. The Figma's outline is lighter; /75 is the closest that keeps 3:1 contrast. */
export function AuthCheckbox({ className, ...props }: ComponentProps<typeof Checkbox>) {
  return <Checkbox className={cn("size-5 border-muted-foreground/75", className)} {...props} />;
}

export function AuthButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("h-12.5 w-full rounded-xl text-[15px] font-normal", className)}
      {...props}
    />
  );
}

/**
 * Bold primary text link ("Forgot password?", "Back to sign in"). Links get a
 * solid focus ring: the global outline-ring/50 is too faint to see.
 */
export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "rounded-sm text-sm font-semibold text-primary underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    />
  );
}
