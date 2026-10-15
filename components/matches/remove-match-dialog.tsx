"use client";

import { WarningIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import { ActionDialogContent } from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { MatchDetail } from "@/types/matches";

/** Confirms dissolving a match for both users, optionally telling them. */
export function RemoveMatchDialog({
  match,
  open,
  onOpenChange,
  trigger,
}: {
  match: MatchDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it, so focus returns there when it closes. */
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent className="max-w-110">
        {/* Mounted only while open, so the checkbox starts clear each time. */}
        <RemoveMatchBody match={match} />
      </ActionDialogContent>
    </Dialog>
  );
}

function RemoveMatchBody({ match }: { match: MatchDetail }) {
  const notifyId = useId();
  const [notify, setNotify] = useState(false);
  // ⚠️ PROVISIONAL: the Figma's audit reference; the invalidate endpoint returns none yet.
  const actionId = `#ADM-${match.publicId.replace(/\D/g, "")}-MTCH`;

  return (
    <>
      <div className="flex min-h-0 flex-col items-center overflow-y-auto px-6 pt-10 pb-9 text-center">
        <span
          aria-hidden
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-destructive"
        >
          <WarningIcon weight="bold" className="size-8" />
        </span>
        <DialogPrimitive.Title className="mt-6 text-2xl leading-8 font-bold">
          Remove Match?
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-4 text-sm/5 text-muted-foreground">
          Are you sure you want to proceed? This action will immediately end the ongoing
          conversation and dissolve the match for both users. This process is permanent and cannot
          be undone.
        </DialogPrimitive.Description>
        <div className="mt-7 flex w-full gap-4 rounded-xl border border-muted-strong bg-muted p-6 text-left dark:border-border">
          <Checkbox
            id={notifyId}
            checked={notify}
            onCheckedChange={(checked) => setNotify(checked === true)}
            className="mt-0.5 size-4.5 rounded-[4px] border-border bg-surface data-checked:border-primary"
          />
          <label htmlFor={notifyId} className="cursor-pointer">
            <span className="block text-[13px] font-semibold tracking-wide">
              Notify Users (optional)
            </span>
            <span className="mt-2 block text-[13px]/5 text-muted-foreground">
              Send a system notification to both parties informing them the match has been
              terminated by an administrator.
            </span>
          </label>
        </div>
        <div className="mt-9 grid w-full grid-cols-2 gap-3.5">
          <DialogPrimitive.Close asChild>
            <Button
              variant="outline"
              className="h-14 rounded-[10px] border-outline bg-background text-[17px] font-normal"
            >
              Cancel
            </Button>
          </DialogPrimitive.Close>
          {/* UI only: POST /admin/matching/{id}/invalidate isn't wired yet. */}
          <Button
            onClick={() => toast("Removing matches isn't available yet")}
            className="h-14 rounded-[10px] bg-destructive text-[17px] font-normal text-white shadow-[0_8px_20px_-6px_rgb(186_26_26/0.5)] hover:bg-destructive/90"
          >
            Remove Match
          </Button>
        </div>
      </div>
      <p className="shrink-0 border-t bg-container py-2.5 text-center text-xs text-muted-foreground dark:bg-muted">
        Action ID: {actionId}
      </p>
    </>
  );
}
