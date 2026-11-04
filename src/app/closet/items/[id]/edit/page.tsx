import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";
import { signedPhotoUrls } from "@/lib/photos";
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
  const photoUrls = await signedPhotoUrls(supabase, [item.photo_path]);
  const currentPhotoSrc = (item.photo_path && photoUrls.get(item.photo_path)) || item.photo_url;

  return (
    <section>
      <p className="label">Edit item</p>
      <h1 className="mt-1 mb-8 text-3xl font-display">{item.name}</h1>
      <ItemForm
        action={updateItem.bind(null, item.id)}
        categories={categories ?? []}
        item={item}
        currentPhotoSrc={currentPhotoSrc}
        cancelHref={`/closet/items/${item.id}`}
      />
    </section>
  );
}
