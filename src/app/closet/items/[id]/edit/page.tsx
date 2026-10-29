import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";
import { updateItem } from "../../actions";
import { ItemForm } from "../../item-form";

export default async function EditItemPage({ params }: PageProps<"/closet/items/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: item }, { data: categories }] = await Promise.all([
    supabase.from("items").select("*").eq("id", id).maybeSingle<Item>(),
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
  ]);
  if (!item) notFound();

  return (
    <section>
      <p className="label">Edit item</p>
      <h1 className="mt-1 mb-8 text-3xl font-medium tracking-tight">{item.name}</h1>
      <ItemForm
        action={updateItem.bind(null, item.id)}
        categories={categories ?? []}
        item={item}
        cancelHref={`/closet/items/${item.id}`}
      />
    </section>
  );
}
