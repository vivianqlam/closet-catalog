"use server";

import { revalidatePath } from "next/cache";
import { PHOTO_BUCKET, PHOTO_MAX_BYTES, PHOTO_TYPES, cleanPhotoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export type PhotoState = { error?: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Loads the item (only works if it's yours) so we know which old photo to clean up.
async function loadItem(itemId: string) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("id, photo_path")
    .eq("id", itemId)
    .maybeSingle<{ id: string; photo_path: string | null }>();
  return { supabase, item };
}

function refresh(itemId: string) {
  revalidatePath("/closet");
  revalidatePath(`/closet/items/${itemId}`);
}

// Saves the one photo the user picked (already shrunk in their browser).
export async function uploadPhoto(itemId: string, formData: FormData): Promise<PhotoState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a photo." };
  if (!PHOTO_TYPES.includes(file.type)) return { error: "Please use a JPG, PNG or WebP photo." };
  if (file.size > PHOTO_MAX_BYTES) return { error: "That photo is too large. Please try a smaller one." };

  const { supabase, item } = await loadItem(itemId);
  if (!item) return { error: "Couldn't find that item." };

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return { error: "Please log in again." };

  // Each user's photos go in a folder named after their account; the storage
  // rules only let you touch your own folder.
  const path = `${userId}/${item.id}-${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "Couldn't upload that photo. Please try again." };

  const { error } = await supabase
    .from("items")
    .update({ photo_path: path, photo_url: null })
    .eq("id", item.id);
  if (error) {
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    return { error: "Couldn't save that photo. Please try again." };
  }

  if (item.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([item.photo_path]);
  refresh(item.id);
  return {};
}

// Uses a product image from a store's website instead of an upload.
export async function setPhotoUrl(
  itemId: string,
  _prev: PhotoState,
  formData: FormData,
): Promise<PhotoState> {
  const checked = cleanPhotoUrl(String(formData.get("photo_url") ?? ""));
  if ("error" in checked) return checked;

  const { supabase, item } = await loadItem(itemId);
  if (!item) return { error: "Couldn't find that item." };

  const { error } = await supabase
    .from("items")
    .update({ photo_url: checked.url, photo_path: null })
    .eq("id", item.id);
  if (error) return { error: "Couldn't save that link. Please try again." };

  if (item.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([item.photo_path]);
  refresh(item.id);
  return {};
}

export async function removePhoto(itemId: string) {
  const { supabase, item } = await loadItem(itemId);
  if (!item) return;
  await supabase.from("items").update({ photo_path: null, photo_url: null }).eq("id", item.id);
  if (item.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([item.photo_path]);
  refresh(item.id);
}
