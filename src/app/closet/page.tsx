import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { closetHref, readFilters, searchPattern } from "@/lib/closet-filters";
import type { Category, Item } from "@/lib/types";
import { FilterBar } from "./filter-bar";
import { StarButton } from "./star-button";
import { Swatch } from "./swatch";

type GridItem = Pick<Item, "id" | "name" | "color" | "brand" | "category_id">;

export default async function ClosetPage({ searchParams }: PageProps<"/closet">) {
  const filters = readFilters(await searchParams);
  const supabase = await createClient();

  // Search, season, formality and sort run in the database. Category and
  // Starred are applied below so each tab can show how many items match.
  let query = supabase.from("items").select("id, name, color, brand, category_id");
  const pattern = searchPattern(filters.q);
  if (pattern) query = query.or(`name.ilike.${pattern},brand.ilike.${pattern}`);
  if (filters.season === "all-season") query = query.eq("season", "all-season");
  // A winter search also includes all-season pieces, since those work in winter too.
  else if (filters.season) query = query.in("season", [filters.season, "all-season"]);
  if (filters.formality) query = query.eq("formality", filters.formality);
  if (filters.sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (filters.sort === "worn")
    query = query.order("times_worn", { ascending: false }).order("name");
  else if (filters.sort === "az") query = query.order("name");
  else query = query.order("created_at", { ascending: false });

  const [{ data: categories }, { data: items }, { data: stars }, { count: totalCount }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
      query.returns<GridItem[]>(),
      supabase.from("stars").select("item_id").returns<{ item_id: string }[]>(),
      supabase.from("items").select("id", { count: "exact", head: true }),
    ]);

  const matching = items ?? [];
  const total = totalCount ?? 0;
  const starredIds = new Set((stars ?? []).map((star) => star.item_id));
  const shown = filters.starred
    ? matching.filter((item) => starredIds.has(item.id))
    : filters.category
      ? matching.filter((item) => item.category_id === filters.category)
      : matching;
  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name ?? "";
  const countFor = (id: number) => matching.filter((item) => item.category_id === id).length;
  const narrowed = Boolean(filters.q || filters.season || filters.formality);

  const tabs = [
    {
      href: closetHref(filters, { category: null, starred: false }),
      label: "All",
      count: matching.length,
      active: !filters.category && !filters.starred,
    },
    {
      href: closetHref(filters, { category: null, starred: true }),
      label: "★ Starred",
      count: matching.filter((item) => starredIds.has(item.id)).length,
      active: filters.starred,
    },
    ...(categories ?? []).map((c) => ({
      href: closetHref(filters, { category: c.id, starred: false }),
      label: c.name,
      count: countFor(c.id),
      active: filters.category === c.id,
    })),
  ];

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight">Your closet</h1>
        <p className="label" aria-live="polite">
          {narrowed || filters.category || filters.starred
            ? `Showing ${shown.length} of ${total}`
            : `${total} ${total === 1 ? "item" : "items"}`}
        </p>
      </div>

      {/* key: redraw the bar when the address changes (e.g. after "Clear"). */}
      <FilterBar key={closetHref(filters, {})} filters={filters} />

      <nav aria-label="Categories" className="mt-4 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={`label -mb-px shrink-0 border-b-2 px-3 py-2 ${
              tab.active ? "border-ink !text-ink" : "border-transparent hover:!text-ink"
            }`}
          >
            {tab.label} <span className="ml-1 opacity-60">{tab.count}</span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted">
            {total === 0
              ? "Your closet is empty."
              : narrowed
                ? "Nothing matches those filters."
                : filters.starred
                  ? "No starred pieces yet. Tap ☆ on any item to add it here."
                  : "Nothing in this category yet."}
          </p>
          {narrowed ? (
            <Link
              href={closetHref(filters, { q: "", season: null, formality: null })}
              className="mt-4 inline-block rounded-full border border-line px-5 py-2 text-sm hover:border-ink"
            >
              Clear filters
            </Link>
          ) : (
            !filters.starred && (
              <Link
                href="/closet/items/new"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
              >
                {total === 0 ? "Add your first piece" : "Add an item"}
              </Link>
            )
          )}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((item) => (
            <li key={item.id} className="relative">
              <Link href={`/closet/items/${item.id}`} className="group block">
                <div className="flex aspect-square items-center justify-center bg-tile transition group-hover:-translate-y-1">
                  <Swatch color={item.color} />
                </div>
                <p className="mt-3 text-sm font-medium group-hover:text-accent">{item.name}</p>
                <p className="label mt-0.5">
                  {[categoryName(item.category_id), item.brand].filter(Boolean).join(" · ")}
                </p>
              </Link>
              {/* Outside the link so starring doesn't open the item. */}
              <StarButton
                itemId={item.id}
                itemName={item.name}
                starred={starredIds.has(item.id)}
                className="absolute top-2 right-2"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
