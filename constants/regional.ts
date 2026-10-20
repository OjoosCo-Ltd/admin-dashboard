// The language and timezone choices Settings offers (Language & Region, and
// General's platform defaults). Profile reads its timezone label from here too.

/** Each language is named in itself, and tagged with its `lang` so screen readers pronounce it. */
export const LANGUAGES = [
  { value: "en-US", label: "English (US)", lang: "en-US" },
  { value: "en-GB", label: "English (UK)", lang: "en-GB" },
  { value: "fr-FR", label: "Français", lang: "fr" },
  { value: "es-ES", label: "Español", lang: "es" },
  { value: "pt-BR", label: "Português (Brasil)", lang: "pt-BR" },
  { value: "de-DE", label: "Deutsch", lang: "de" },
] as const;

export interface TimezoneOption {
  /** IANA zone. */
  value: string;
  label: string;
  /** What "Current time in …" calls it. */
  short: string;
}

// A short list of common zones, not the whole IANA database. Zones that move their clocks
// carry no offset, since a fixed one would be wrong for half the year.
export const TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC", short: "UTC" },
  { value: "Europe/London", label: "GMT/BST (London)", short: "London" },
  { value: "Africa/Accra", label: "GMT (Accra) UTC+00:00", short: "Accra" },
  { value: "Africa/Lagos", label: "WAT (West Africa Time) UTC+01:00", short: "WAT" },
  { value: "Europe/Paris", label: "CET/CEST (Paris, Berlin)", short: "Paris" },
  { value: "Africa/Johannesburg", label: "SAST (South Africa Time) UTC+02:00", short: "SAST" },
  { value: "Africa/Nairobi", label: "EAT (East Africa Time) UTC+03:00", short: "EAT" },
  { value: "Asia/Dubai", label: "GST (Gulf Standard Time) UTC+04:00", short: "Dubai" },
  { value: "Asia/Kolkata", label: "IST (India Standard Time) UTC+05:30", short: "IST" },
  { value: "Asia/Singapore", label: "SGT (Singapore) UTC+08:00", short: "SGT" },
  { value: "Asia/Tokyo", label: "JST (Japan Standard Time) UTC+09:00", short: "JST" },
  { value: "Australia/Sydney", label: "AEST/AEDT (Sydney)", short: "Sydney" },
  { value: "America/Sao_Paulo", label: "BRT (Brasília Time) UTC−03:00", short: "BRT" },
  { value: "America/New_York", label: "EST/EDT (New York)", short: "New York" },
  { value: "America/Chicago", label: "CST/CDT (Chicago)", short: "Chicago" },
  { value: "America/Denver", label: "MST/MDT (Denver)", short: "Denver" },
  { value: "America/Los_Angeles", label: "PST/PDT (Los Angeles)", short: "Los Angeles" },
];

/** A zone from the list, or a plain stand-in for one saved from elsewhere. */
export function timezoneFor(value: string): TimezoneOption {
  const city = value.split("/").at(-1)?.replaceAll("_", " ") ?? value;
  return (
    TIMEZONES.find((zone) => zone.value === value) ?? {
      value,
      label: value.replaceAll("_", " "),
      short: city,
    }
  );
}
