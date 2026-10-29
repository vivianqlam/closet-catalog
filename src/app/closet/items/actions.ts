"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readItemValues, validateItem, type ItemErrors, type ItemValues } from "@/lib/validation";

export type ItemFormState = {
  error?: string;
  errors?: ItemErrors;
  // What was typed, so the form can show it again after a failed save.
  values?: ItemValues;
};

const FIX_FIELDS = "Please fix the highlighted fields.";

export async function createItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const values = readItemValues(formData);
  const result = validateItem(values);
  if (!result.ok) return { error: FIX_FIELDS, errors: result.errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.from("items").insert(result.row).select("id").single();

  if (error) return { error: "Couldn't save this item. Please try again.", values };

  revalidatePath("/closet");
  redirect(`/closet/items/${data.id}`);
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const values = readItemValues(formData);
  const result = validateItem(values);
  if (!result.ok) return { error: FIX_FIELDS, errors: result.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.from("items").update(result.row).eq("id", id);

  if (error) return { error: "Couldn't save your changes. Please try again.", values };

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
