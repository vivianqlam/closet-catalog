"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PHOTO_BUCKET, savePhoto } from "@/lib/photos";
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

  // Optional photo picked on the Add item form (already cropped and shrunk).
  // If it fails, the item is still saved and its page says so.
  const photo = formData.get("photo");
  let photoFailed = false;
  if (photo instanceof File && photo.size > 0) {
    photoFailed = Boolean((await savePhoto(supabase, { id: data.id, photo_path: null }, photo)).error);
  }

  revalidatePath("/closet");
  redirect(`/closet/items/${data.id}${photoFailed ? "?photo=failed" : ""}`);
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
  const { data: item } = await supabase.from("items").select("photo_path").eq("id", id).maybeSingle();
  await supabase.from("items").delete().eq("id", id);
  // Remove the uploaded photo too, so no orphaned files stay in storage.
  if (item?.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([item.photo_path]);
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

// Star or unstar an item. One row in the stars table means "starred".
export async function toggleStar(itemId: string, starred: boolean) {
  const supabase = await createClient();
  if (starred) {
    await supabase.from("stars").delete().eq("item_id", itemId);
  } else {
    await supabase.from("stars").insert({ item_id: itemId });
  }
  revalidatePath("/closet");
  revalidatePath(`/closet/items/${itemId}`);
}
