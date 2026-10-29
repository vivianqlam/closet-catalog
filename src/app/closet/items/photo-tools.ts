// Browser-side photo helpers shared by the Add item form and the item page.
import imageCompression from "browser-image-compression";

// Shrink big phone photos in the browser before they're sent anywhere.
export async function shrink(file: File) {
  const fileType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    fileType,
    useWebWorker: true,
  });
}

export const UNREADABLE_PHOTO = "Couldn't read that photo. Please try a JPG or PNG.";

// Makes a local preview address for a picked photo, after checking this
// browser can actually open it. Returns null if it can't.
export async function openPhoto(file: File): Promise<string | null> {
  const src = URL.createObjectURL(file);
  try {
    const test = new Image();
    test.src = src;
    await test.decode();
    return src;
  } catch {
    URL.revokeObjectURL(src);
    return null;
  }
}
