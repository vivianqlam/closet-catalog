"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ItemFormState = { error?: string };

// Turns the submitted form into a row for the items table.
// Blank optional fields are saved as empty (null), not as "".
function readItemForm(formData: FormData) {
  const text = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? null : value;
  };
  return {
    name: text("name") ?? "",
    category_id: Number(formData.get("category_id")),
    color: text("color"),
    season: text("season"),
    formality: text("formality"),
    brand: text("brand"),
    notes: text("notes"),
  };
}

export async function createItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert(readItemForm(formData))
    .select("id")
    .single();

  if (error) return { error: "Couldn't save this item. Please check the fields and try again." };

  revalidatePath("/closet");
  redirect(`/closet/items/${data.id}`);
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update(readItemForm(formData)).eq("id", id);

  if (error) return { error: "Couldn't save your changes. Please check the fields and try again." };

  revalidatePath("/closet");
  redirect(`/closet/items/${id}`);
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  await supabase.from("items").delete().eq("id", id);
  revalidatePath("/closet");
  redirect("/closet");
}

// "Wore it": add 1 to the times-worn count and remember today's date.
export async function woreIt(id: string) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("times_worn")
    .eq("id", id)
    .single();
  if (!item) return;

  await supabase
    .from("items")
    .update({
      times_worn: item.times_worn + 1,
      last_worn_on: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);
  revalidatePath(`/closet/items/${id}`);
}
