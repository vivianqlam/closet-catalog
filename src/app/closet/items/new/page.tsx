import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { createItem } from "../actions";
import { ItemForm } from "../item-form";

export default async function NewItemPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .returns<Category[]>();

  return (
    <section>
      <p className="label">New item</p>
      <h1 className="mt-1 mb-8 text-3xl font-medium tracking-tight">Add to your closet</h1>
      <ItemForm action={createItem} categories={categories ?? []} cancelHref="/closet" />
    </section>
  );
}
