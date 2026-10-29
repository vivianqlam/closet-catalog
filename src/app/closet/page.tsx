import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";
import { Swatch } from "./swatch";

export default async function ClosetPage({ searchParams }: PageProps<"/closet">) {
  const { category } = await searchParams;
  const activeId = Number(category) || null;

  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
    supabase
      .from("items")
      .select("id, name, color, brand, category_id")
      .order("created_at", { ascending: false })
      .returns<Pick<Item, "id" | "name" | "color" | "brand" | "category_id">[]>(),
  ]);

  const allItems = items ?? [];
  const shown = activeId ? allItems.filter((item) => item.category_id === activeId) : allItems;
  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name ?? "";
  const countFor = (id: number) => allItems.filter((item) => item.category_id === id).length;

  const tabs = [
    { href: "/closet", label: "All", count: allItems.length, active: activeId === null },
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
            {allItems.length === 0 ? "Your closet is empty." : "Nothing in this category yet."}
          </p>
          <Link
            href="/closet/items/new"
            className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
          >
            Add your first piece
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((item) => (
            <li key={item.id}>
              <Link href={`/closet/items/${item.id}`} className="group block">
                <div className="flex aspect-square items-center justify-center bg-tile transition group-hover:-translate-y-1">
                  <Swatch color={item.color} />
                </div>
                <p className="mt-3 text-sm font-medium group-hover:text-accent">{item.name}</p>
                <p className="label mt-0.5">
                  {[categoryName(item.category_id), item.brand].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
