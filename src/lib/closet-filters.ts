// Reads the closet's search, filter and sort choices from the page address
// (e.g. /closet?q=coat&season=winter&sort=worn) and builds links that keep them.
import { FORMALITIES, SEASONS, type Formality, type Season } from "./types";

export const SORTS = {
  newest: "Newest",
  oldest: "Oldest",
  worn: "Most worn",
  az: "A–Z",
} as const;
export type Sort = keyof typeof SORTS;

export type ClosetFilters = {
  q: string;
  season: Season | null;
  formality: Formality | null;
  sort: Sort;
  category: number | null;
  starred: boolean;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

export function readFilters(params: Params): ClosetFilters {
  const season = first(params.season);
  const formality = first(params.formality);
  const sort = first(params.sort);
  const starred = first(params.starred) === "1";
  return {
    q: first(params.q).slice(0, 80),
    season: SEASONS.includes(season as Season) ? (season as Season) : null,
    formality: FORMALITIES.includes(formality as Formality) ? (formality as Formality) : null,
    sort: sort in SORTS ? (sort as Sort) : "newest",
    category: starred ? null : Number(first(params.category)) || null,
    starred,
  };
}

// Link to /closet with the current choices plus any changes.
export function closetHref(filters: ClosetFilters, changes: Partial<ClosetFilters>) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.season) params.set("season", next.season);
  if (next.formality) params.set("formality", next.formality);
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.starred) params.set("starred", "1");
  else if (next.category) params.set("category", String(next.category));
  const query = params.toString();
  return query ? `/closet?${query}` : "/closet";
}

// Search text goes inside a database filter, where commas, brackets and
// wildcards have special meaning, so those characters are dropped.
export function searchPattern(q: string) {
  const cleaned = q.replace(/[,()*%_\\"]/g, " ").trim();
  return cleaned ? `%${cleaned}%` : null;
}
