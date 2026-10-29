"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FORMALITIES, SEASONS } from "@/lib/types";
import { SORTS, closetHref, type ClosetFilters } from "@/lib/closet-filters";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const controlClass =
  "border border-line bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none";

// Search box plus season, formality and sort menus. Changing a menu applies it
// right away; the search applies on Enter or "Search".
export function FilterBar({ filters }: { filters: ClosetFilters }) {
  const router = useRouter();

  const apply = (form: HTMLFormElement) => {
    const data = new FormData(form);
    router.push(
      closetHref(filters, {
        q: String(data.get("q") ?? "").trim(),
        season: (data.get("season") || null) as ClosetFilters["season"],
        formality: (data.get("formality") || null) as ClosetFilters["formality"],
        sort: data.get("sort") as ClosetFilters["sort"],
      }),
    );
  };

  const active = filters.q || filters.season || filters.formality || filters.sort !== "newest";

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      onChange={(event) => {
        if (event.target instanceof HTMLSelectElement) apply(event.currentTarget);
      }}
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      <label className="sr-only" htmlFor="q">
        Search by name or brand
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={filters.q}
        placeholder="Search name or brand"
        className={`${controlClass} min-w-0 flex-1 basis-56`}
      />

      <label className="sr-only" htmlFor="season-filter">
        Season
      </label>
      <select id="season-filter" name="season" defaultValue={filters.season ?? ""} className={controlClass}>
        <option value="">Any season</option>
        {SEASONS.filter((s) => s !== "all-season").map((s) => (
          <option key={s} value={s}>
            {capitalize(s)}
          </option>
        ))}
        <option value="all-season">All-season only</option>
      </select>

      <label className="sr-only" htmlFor="formality-filter">
        Formality
      </label>
      <select id="formality-filter" name="formality" defaultValue={filters.formality ?? ""} className={controlClass}>
        <option value="">Any formality</option>
        {FORMALITIES.map((f) => (
          <option key={f} value={f}>
            {capitalize(f)}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="sort">
        Sort
      </label>
      <select id="sort" name="sort" defaultValue={filters.sort} className={controlClass}>
        {Object.entries(SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            Sort: {label}
          </option>
        ))}
      </select>

      <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent">
        Search
      </button>
      {active && (
        <Link
          href={closetHref(filters, { q: "", season: null, formality: null, sort: "newest" })}
          className="px-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
