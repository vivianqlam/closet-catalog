// Photo helpers shared by the closet pages (server side only).
import type { SupabaseClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "item-photos";
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
