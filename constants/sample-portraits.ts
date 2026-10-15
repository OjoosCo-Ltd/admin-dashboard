/**
 * Stand-in profile photos for sample data: randomuser.me's fixed portraits,
 * until the API's signed profile-image URLs are wired. Avatars fall back to
 * initials whenever one fails to load.
 */
export const portrait = (path: `${"men" | "women"}/${number}`) =>
  `https://randomuser.me/api/portraits/${path}.jpg`;

/**
 * A stand-in cover or thumbnail: picsum.photos' photo for `seed`, the same one
 * every time. Swap for the API's resource images when they're wired.
 */
export const sampleCover = (seed: string, width = 160, height = width) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;
