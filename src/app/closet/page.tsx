import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";

export default async function ClosetPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
    supabase.from("items").select("category_id").returns<Pick<Item, "category_id">[]>(),
  ]);

  const countFor = (categoryId: number) =>
    (items ?? []).filter((item) => item.category_id === categoryId).length;

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold">Your closet</h1>
      <p className="mt-2 text-charcoal/70">
        {items?.length ?? 0} {items?.length === 1 ? "item" : "items"} so far.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(categories ?? []).map((category) => (
          <li
            key={category.id}
            className="rounded-2xl border border-line bg-white px-4 py-5"
          >
            <p className="font-serif text-lg font-semibold">{category.name}</p>
            <p className="mt-1 text-sm text-charcoal/60">{countFor(category.id)} items</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
