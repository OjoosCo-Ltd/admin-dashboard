"use client";

import type { ComponentProps } from "react";
import { toast } from "sonner";

/** An unstyled button whose action has no endpoint yet: it says so in a toast. */
export function ToastButton({
  message,
  ...props
}: Omit<ComponentProps<"button">, "onClick"> & { message: string }) {
  return <button type="button" onClick={() => toast(message)} {...props} />;
}
