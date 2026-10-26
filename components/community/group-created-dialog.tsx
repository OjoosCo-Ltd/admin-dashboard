"use client";

import {
  BarbellIcon,
  BooksIcon,
  CalendarPlusIcon,
  CheckIcon,
  CookingPotIcon,
  FilmSlateIcon,
  GameControllerIcon,
  GlobeHemisphereWestIcon,
  type Icon,
  LightbulbIcon,
  LockSimpleIcon,
  MegaphoneSimpleIcon,
  MountainsIcon,
  MusicNotesIcon,
  PaletteIcon,
  RocketLaunchIcon,
  SoccerBallIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { toast } from "sonner";

import type { GroupFormValues } from "@/components/community/group-form-dialog";
import { ACTION_DIALOG_SCRIM } from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { GROUP_CATEGORIES, type GroupCategory } from "@/constants/community";
import { enabled, FEATURES, type Feature } from "@/constants/features";

const CATEGORY_ICONS: Record<GroupCategory, Icon> = {
  BOOKS_AND_READING: BooksIcon,
  MOVIES_AND_TV: FilmSlateIcon,
  MUSIC_AND_CONCERTS: MusicNotesIcon,
  FOOTBALL_AND_SPORTS: SoccerBallIcon,
  FOOD_AND_COOKING: CookingPotIcon,
  TRAVEL_AND_ADVENTURE: MountainsIcon,
  FITNESS_AND_WELLNESS: BarbellIcon,
  ARTS_AND_CULTURE: PaletteIcon,
  GAMING: GameControllerIcon,
  ENTREPRENEURSHIP: RocketLaunchIcon,
};

const NEXT_STEPS = enabled<{ label: string; icon: Icon; feature?: Feature }>([
  { label: "Invite Initial Members", icon: UserPlusIcon, feature: "groupInvites" },
  { label: "Post First Announcement", icon: MegaphoneSimpleIcon },
  { label: "Create Welcome Event", icon: CalendarPlusIcon },
]);

export interface CreatedGroup {
  values: GroupFormValues;
  /** An object URL for the picked icon, owned (and revoked) by whoever opened this. */
  iconUrl: string | null;
}

/**
 * The success screen after Create Group: the new group's card, a way into its
 * dashboard, the next steps and a tip beneath. UI only: nothing was saved.
 */
export function GroupCreatedDialog({
  created,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  created: CreatedGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: ComponentProps<typeof DialogPrimitive.Content>["onCloseAutoFocus"];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={ACTION_DIALOG_SCRIM} />
        {/* Two panels, the dialog and the tip below it, scrolling together on short screens. */}
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-168 -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          {created && <CreatedContent created={created} />}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

// Esc or a click outside closes it; the Figma has no close button.
function CreatedContent({ created }: { created: CreatedGroup }) {
  const { values, iconUrl } = created;
  const category = GROUP_CATEGORIES.find((option) => option.value === values.category);
  const CategoryIcon = category ? CATEGORY_ICONS[category.value] : UsersThreeIcon;
  const PrivacyIcon = values.privacy === "public" ? GlobeHemisphereWestIcon : LockSimpleIcon;
  const name = values.name.trim();

  return (
    <>
      <div className="shrink-0 rounded-[24px] bg-background px-10 py-10 text-center text-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.25)] max-sm:px-5 max-sm:py-8">
        <span
          aria-hidden
          className="mx-auto flex size-13.5 items-center justify-center rounded-full bg-action text-white dark:bg-primary dark:text-primary-foreground"
        >
          <CheckIcon weight="bold" className="size-7" />
        </span>
        <DialogPrimitive.Title className="mx-auto mt-8 max-w-120 text-[30px]/10 font-semibold max-sm:text-2xl/8">
          &lsquo;{name}&rsquo; has been created.
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mx-auto mt-4 max-w-125 text-base/6 text-muted-foreground">
          Your new community group is now live and visible to members in the Xparience app.
        </DialogPrimitive.Description>

        <div className="mt-10 flex items-center gap-6 rounded-xl border border-border/50 bg-muted p-6 text-left max-sm:gap-4 max-sm:p-4 dark:border-border">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local object URL, which next/image can't optimize
            <img
              src={iconUrl}
              alt=""
              className="size-16 shrink-0 rounded-lg bg-background object-cover shadow-xs"
            />
          ) : (
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-background text-action shadow-xs dark:text-primary"
            >
              <CategoryIcon weight="bold" className="size-8" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xl/7 font-semibold">{name}</p>
            <p className="mt-1 flex flex-wrap gap-x-8 gap-y-1 text-[15px]/5 text-muted-foreground">
              <span className="flex items-center gap-1">
                <CategoryIcon aria-hidden weight="bold" className="size-4" />
                {category?.label}
              </span>
              {FEATURES.groupPrivacy && (
                <span className="flex items-center gap-1">
                  <PrivacyIcon aria-hidden weight="fill" className="size-4.5" />
                  {values.privacy === "public" ? "Public" : "Private"}
                </span>
              )}
            </p>
          </div>
        </div>

        <Button
          type="button"
          // UI only: the group wasn't saved, so it has no dashboard to open.
          onClick={() => toast("New groups' dashboards aren't available yet")}
          className="mt-10 h-13.5 w-full max-w-70 rounded-[12px] bg-action text-sm font-semibold tracking-wide text-white shadow-[0_6px_14px_rgb(0_80_105/0.25)] hover:bg-action/90 dark:bg-primary dark:text-primary-foreground"
        >
          Go to Group Dashboard
        </Button>

        <div className="mt-14 border-t border-border/50 pt-10 text-left dark:border-border">
          <h3 className="text-xs/4 font-semibold tracking-wider uppercase">Next Steps</h3>
          <ul
            className={cn(
              "mt-6 grid gap-3",
              NEXT_STEPS.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
            )}
          >
            {NEXT_STEPS.map((step) => (
              <li key={step.label}>
                <button
                  type="button"
                  onClick={() => toast(`${step.label} isn't available yet`)}
                  className="flex h-full min-h-25.5 w-full flex-col items-center justify-center gap-1 rounded-xl border border-border/50 bg-background px-4 py-4 text-[13px]/5.5 font-semibold tracking-wide transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
                >
                  <step.icon
                    aria-hidden
                    weight="bold"
                    className="size-6 text-review dark:text-subtle-foreground"
                  />
                  <span className="max-w-36">{step.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="flex shrink-0 gap-3 rounded-[20px] bg-[#e2edf3] p-6 text-left text-foreground max-sm:p-4 dark:bg-info-soft/15">
        <LightbulbIcon
          aria-hidden
          weight="fill"
          className="mt-0.5 size-5 shrink-0 text-action-icon"
        />
        <div>
          <p className="text-[13px]/5 font-semibold tracking-wide">Smart Insight</p>
          <p className="text-[13px]/5 text-muted-foreground">
            Groups with an initial announcement see 40% higher engagement in their first week.
          </p>
        </div>
      </aside>
    </>
  );
}
