/**
 * The backend's group categories (AdminCreateGroupDto.category), labeled for
 * the create and edit dialogs. The sample groups still carry the Figma's own
 * labels ("Lifestyle", "Creative", "Outdoors"), which have no equivalent here.
 */
export const GROUP_CATEGORIES = [
  { value: "BOOKS_AND_READING", label: "Books & Reading" },
  { value: "MOVIES_AND_TV", label: "Movies & TV" },
  { value: "MUSIC_AND_CONCERTS", label: "Music & Concerts" },
  { value: "FOOTBALL_AND_SPORTS", label: "Football & Sports" },
  { value: "FOOD_AND_COOKING", label: "Food & Cooking" },
  { value: "TRAVEL_AND_ADVENTURE", label: "Travel & Adventure" },
  { value: "FITNESS_AND_WELLNESS", label: "Fitness & Wellness" },
  { value: "ARTS_AND_CULTURE", label: "Arts & Culture" },
  { value: "GAMING", label: "Gaming" },
  { value: "ENTREPRENEURSHIP", label: "Entrepreneurship" },
] as const;

export type GroupCategory = (typeof GROUP_CATEGORIES)[number]["value"];
