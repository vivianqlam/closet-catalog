// Small helpers for showing trips.
import type { Climate, Season } from "./types";

// Which seasons' clothes suit each climate. All-season pieces always fit.
const CLIMATE_SEASONS: Record<Climate, Season[]> = {
  hot: ["summer"],
  warm: ["summer", "spring"],
  mild: ["spring", "fall"],
  cold: ["fall", "winter"],
  snow: ["winter"],
};

export function seasonsFor(climate: Climate): Season[] {
  return [...CLIMATE_SEASONS[climate], "all-season"];
}

const format = (date: string, withYear: boolean) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });

// "Nov 12 – Nov 15, 2026", or one date, or "" when there are none.
export function formatTripDates(start: string | null, end: string | null) {
  if (start && end) {
    if (start === end) return format(start, true);
    const sameYear = start.slice(0, 4) === end.slice(0, 4);
    return `${format(start, !sameYear)} – ${format(end, true)}`;
  }
  const only = start ?? end;
  return only ? format(only, true) : "";
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
