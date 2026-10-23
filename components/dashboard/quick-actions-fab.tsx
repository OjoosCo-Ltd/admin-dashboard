"use client";

import { MegaphoneIcon, PlusIcon, SealCheckIcon, UserMinusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";

import { AnnouncementDialog } from "@/components/dashboard/announcement-dialog";
import { ReviewVerificationDialog } from "@/components/dashboard/review-verification-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/constants/features";
import type { AnnouncementAudience, VerificationRequest } from "@/types/dashboard";

// Each action is its own white pill; the menu panel itself is invisible.
const pill = "h-12 w-61 gap-2.5 rounded-[12px] border bg-background pl-6 text-base font-medium";

/**
 * The floating + in the bottom-right corner: a speed dial of admin shortcuts.
 * Approve Verification opens its dialog and Suspend User goes to the Users page. Send
 * Announcement is hidden until there's an announcement route.
 */
export function QuickActionsFab({
  verificationRequest,
  audienceSizes,
}: {
  verificationRequest: VerificationRequest;
  audienceSizes: Record<AnnouncementAudience, number>;
}) {
  const [dialog, setDialog] = useState<"verification" | "announcement" | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The menu item that opened the dialog is gone by the time it closes, so
  // focus goes back to the button, once the dialog's focus trap has let go.
  const closeDialog = () => {
    setDialog(null);
    setTimeout(() => triggerRef.current?.focus());
  };

  return (
    <>
      {/* Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts this fixed button. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          ref={triggerRef}
          aria-label="Quick actions"
          className="group/fab fixed right-4 bottom-4 z-30 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_16px_28px_-13px_rgb(0_0_0/0.33)] transition-colors outline-none hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring/40 md:right-8 md:bottom-8"
        >
          {/* Turned 45° it's the close X. */}
          <PlusIcon
            aria-hidden
            weight="bold"
            className="size-6 transition-transform duration-200 group-data-[state=open]/fab:rotate-45 motion-reduce:transition-none"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          // Opening a dialog: it takes focus, so the menu mustn't hand it back to the button.
          onCloseAutoFocus={(event) => dialog && event.preventDefault()}
          className="flex w-auto min-w-0 flex-col gap-3 overflow-visible rounded-none bg-transparent p-0 shadow-none ring-0"
        >
          <DropdownMenuItem className={pill} onSelect={() => setDialog("verification")}>
            Approve Verification
            {/* fill, not text color: the item recolors its children's text on focus. */}
            <SealCheckIcon aria-hidden weight="fill" className="size-6.5 fill-success" />
          </DropdownMenuItem>
          {FEATURES.announcements && (
            <DropdownMenuItem className={pill} onSelect={() => setDialog("announcement")}>
              Send Announcement
              <MegaphoneIcon aria-hidden weight="fill" className="size-6 -scale-x-100" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild variant="destructive" className={pill}>
            <Link href="/users">
              Suspend User
              <UserMinusIcon aria-hidden weight="fill" className="size-5.5" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReviewVerificationDialog
        request={verificationRequest}
        open={dialog === "verification"}
        onOpenChange={(open) => !open && closeDialog()}
      />
      {FEATURES.announcements && (
        <AnnouncementDialog
          audienceSizes={audienceSizes}
          open={dialog === "announcement"}
          onOpenChange={(open) => !open && closeDialog()}
        />
      )}
    </>
  );
}
