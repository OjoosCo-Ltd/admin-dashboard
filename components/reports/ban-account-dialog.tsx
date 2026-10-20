"use client";

import { ProhibitIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

/**
 * Confirms a permanent ban. The Figma has no frame for it, so this is the
 * smallest safe step: say what's lost, and require an explicit acknowledgement.
 */
export function BanAccountDialog({
  name,
  open,
  onOpenChange,
  trigger,
}: {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionDialogContent className="max-w-120 rounded-[16px] border">
        {/* Mounted only while open, so the acknowledgement starts unticked. */}
        <BanForm name={name} onDone={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

function BanForm({ name, onDone }: { name: string; onDone: () => void }) {
  const checkId = useId();
  const [understood, setUnderstood] = useState(false);
  return (
    <>
      <ActionDialogHeader
        icon={<ProhibitIcon weight="bold" />}
        iconClassName="bg-destructive-container text-destructive dark:bg-destructive/20"
        title={`Permanently ban ${name}?`}
        description="This can't be undone."
        descriptionClassName="mt-0.5 text-sm"
      />
      <ActionDialogBody className="flex flex-col gap-4">
        <p className="text-[15px] leading-6 text-muted-foreground">
          {name}&apos;s account will be closed for good. Their matches, conversations and profile
          are removed, and they can&apos;t sign up again with the same email or phone number.
        </p>
        <label
          htmlFor={checkId}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#f5d5d1] bg-destructive-soft px-4 py-3.5 text-sm dark:border-destructive/40 dark:bg-destructive/10"
        >
          <Checkbox
            id={checkId}
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked === true)}
            className="mt-0.5 data-checked:border-destructive data-checked:bg-destructive dark:data-checked:bg-destructive"
          />
          I understand this permanently removes the account.
        </label>
      </ActionDialogBody>
      <ActionDialogFooter className="bg-background">
        <DialogPrimitive.Close className="h-11 rounded-lg border border-border px-5 text-sm font-semibold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          Cancel
        </DialogPrimitive.Close>
        <button
          type="button"
          disabled={!understood}
          onClick={() => {
            // UI only: there's no ban endpoint wired yet.
            toast("Banning accounts isn't available yet");
            onDone();
          }}
          className="h-11 rounded-lg bg-destructive px-5 text-sm font-semibold text-white outline-none hover:bg-destructive/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-destructive/60 dark:hover:bg-destructive/50"
        >
          Permanently Ban
        </button>
      </ActionDialogFooter>
    </>
  );
}
