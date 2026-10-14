"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useState, type ComponentProps } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

/** Password field with a show/hide toggle. Sized like AuthInput (16px text below md, see auth-controls). */
export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup className={cn("h-12.5 rounded-md", className)}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        className="h-full pl-3.5 text-base md:text-[15px]"
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          className="mr-1 rounded-md text-muted-foreground"
          aria-label="Show password"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
