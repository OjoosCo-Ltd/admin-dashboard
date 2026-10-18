import type { Icon } from "@phosphor-icons/react";
import {
  BookOpenTextIcon,
  CameraIcon,
  PersonSimpleHikeIcon,
  PlantIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Image from "next/image";

import type { CommunityGroup, GroupGlyph } from "@/types/community";

/** Each group glyph's Phosphor stand-in for the Figma's Material icons. */
export const GROUP_GLYPHS: Record<GroupGlyph, Icon> = {
  books: BookOpenTextIcon,
  camera: CameraIcon,
  hiking: PersonSimpleHikeIcon,
  plant: PlantIcon,
};

/**
 * A group's 40px thumbnail in the groups table: its photo, or its glyph on a
 * grey tile when it has none (Weekend Hikers in the Figma).
 */
export function GroupThumbnail({
  group,
  className,
}: {
  group: Pick<CommunityGroup, "imageUrl" | "glyph">;
  className?: string;
}) {
  const Glyph = GROUP_GLYPHS[group.glyph];
  return group.imageUrl ? (
    <Image
      src={group.imageUrl}
      alt=""
      width={40}
      height={40}
      className={cn("size-10 shrink-0 rounded-md border object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-subtle-foreground",
        className,
      )}
    >
      <Glyph weight="bold" className="size-5" />
    </span>
  );
}
