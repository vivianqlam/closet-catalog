// Photo helpers shared by the closet pages (server side only).
import type { SupabaseClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "item-photos";
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Stores a photo (already shrunk in the browser) for one of the user's items,
// points the item at it, and removes the item's previous photo file.
export async function savePhoto(
  supabase: SupabaseClient,
  item: { id: string; photo_path: string | null },
  file: File,
): Promise<{ error?: string }> {
  if (!PHOTO_TYPES.includes(file.type)) return { error: "Please use a JPG, PNG or WebP photo." };
  if (file.size > PHOTO_MAX_BYTES) return { error: "That photo is too large. Please try a smaller one." };

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
  return {};
}

// The bucket is private, so pages show photos through signed links that
// stop working after an hour. Returns a lookup from storage path to link.
export async function signedPhotoUrls(supabase: SupabaseClient, paths: (string | null)[]) {
  const wanted = paths.filter((path): path is string => Boolean(path));
  const urls = new Map<string, string>();
  if (wanted.length === 0) return urls;

  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(wanted, 60 * 60);
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) urls.set(row.path, row.signedUrl);
  }
  return urls;
}

// Checks a pasted product-image link. Only secure (https) web addresses are allowed.
export function cleanPhotoUrl(raw: string): { url: string } | { error: string } {
  const value = raw.trim();
  if (!value) return { error: "Please paste a link to an image." };
  if (value.length > 1000) return { error: "That link is too long. Please use a shorter one." };
  try {
    const url = new URL(value);
    if (url.protocol !== "https:")
      return { error: "Please use a link that starts with https://" };
    return { url: url.toString() };
  } catch {
    return { error: "That doesn't look like a web link. It should start with https://" };
  }
}
