import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";
import { StarButton } from "./star-button";
import { Swatch } from "./swatch";

export default async function ClosetPage({ searchParams }: PageProps<"/closet">) {
  const { category, starred } = await searchParams;
  const showStarred = starred === "1";
  const activeId = showStarred ? null : Number(category) || null;

  const supabase = await createClient();
  const [{ data: categories }, { data: items }, { data: stars }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
    supabase
      .from("items")
      .select("id, name, color, brand, category_id")
      .order("created_at", { ascending: false })
      .returns<Pick<Item, "id" | "name" | "color" | "brand" | "category_id">[]>(),
    supabase.from("stars").select("item_id").returns<{ item_id: string }[]>(),
  ]);

  const allItems = items ?? [];
  const starredIds = new Set((stars ?? []).map((star) => star.item_id));
  const shown = showStarred
    ? allItems.filter((item) => starredIds.has(item.id))
    : activeId
      ? allItems.filter((item) => item.category_id === activeId)
      : allItems;
  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name ?? "";
  const countFor = (id: number) => allItems.filter((item) => item.category_id === id).length;

  const tabs = [
    { href: "/closet", label: "All", count: allItems.length, active: activeId === null && !showStarred },
    { href: "/closet?starred=1", label: "★ Starred", count: starredIds.size, active: showStarred },
    ...(categories ?? []).map((c) => ({
      href: `/closet?category=${c.id}`,
      label: c.name,
      count: countFor(c.id),
      active: activeId === c.id,
    })),
  ];

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight">Your closet</h1>
        <p className="label">
          {allItems.length} {allItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      <nav aria-label="Categories" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
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
            {allItems.length === 0
              ? "Your closet is empty."
              : showStarred
                ? "No starred pieces yet. Tap ☆ on any item to add it here."
                : "Nothing in this category yet."}
          </p>
          {!showStarred && (
            <Link
              href="/closet/items/new"
              className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
            >
              {allItems.length === 0 ? "Add your first piece" : "Add an item"}
            </Link>
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
