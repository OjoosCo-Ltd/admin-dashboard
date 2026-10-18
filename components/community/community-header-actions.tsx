"use client";

import { CalendarDotsIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { EventFormDialog } from "@/components/community/event-form-dialog";
import { type CreatedGroup, GroupCreatedDialog } from "@/components/community/group-created-dialog";
import { GroupFormDialog } from "@/components/community/group-form-dialog";
import { Button } from "@/components/ui/button";

/**
 * The Groups tab's actions: Create Event, and Create Community Group, which
 * opens the form and then its success screen.
 */
export function GroupsHeaderActions() {
  const [eventOpen, setEventOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState<CreatedGroup | null>(null);
  const [createdOpen, setCreatedOpen] = useState(false);
  const createButton = useRef<HTMLButtonElement>(null);
  // Set while the form hands over to the success screen, so it doesn't take focus back.
  const handingOff = useRef(false);

  // Frees the new group's icon preview once the success screen is replaced or gone.
  useEffect(
    () => () => {
      if (created?.iconUrl) URL.revokeObjectURL(created.iconUrl);
    },
    [created],
  );

  return (
    <>
      <EventFormDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        trigger={
          <Button
            variant="outline"
            className="h-14 gap-2.5 rounded-[12px] bg-transparent px-6 text-sm font-normal text-subtle-foreground max-sm:w-full"
          >
            <CalendarDotsIcon aria-hidden className="size-5.5 text-muted-foreground" />
            Create Event
          </Button>
        }
      />
      <GroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(values) => {
          // UI only: the success screen is the Figma's, but POST /admin/community/groups isn't wired.
          toast("Creating groups isn't available yet, so nothing was saved");
          handingOff.current = true;
          setFormOpen(false);
          setCreated({
            values,
            iconUrl: values.icon ? URL.createObjectURL(values.icon) : null,
          });
          setCreatedOpen(true);
        }}
        onCloseAutoFocus={(event) => {
          if (handingOff.current) event.preventDefault();
          handingOff.current = false;
        }}
        trigger={
          <Button
            ref={createButton}
            className="h-14 gap-2.5 rounded-[12px] px-6 text-base font-medium max-sm:w-full"
          >
            <PlusIcon aria-hidden weight="bold" className="size-3.5" />
            Create Community Group
          </Button>
        }
      />
      <GroupCreatedDialog
        created={created}
        open={createdOpen}
        onOpenChange={setCreatedOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          createButton.current?.focus();
        }}
      />
    </>
  );
}

/** The Events tab's one action, in the primary style its Figma gives it. */
export function CreateEventButton() {
  const [open, setOpen] = useState(false);
  return (
    <EventFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="h-14 gap-2.5 rounded-[12px] px-6 text-base font-medium max-sm:w-full">
          <PlusIcon aria-hidden weight="bold" className="size-3.5" />
          Create Event
        </Button>
      }
    />
  );
}
