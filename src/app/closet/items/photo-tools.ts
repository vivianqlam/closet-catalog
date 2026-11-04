// Browser-side photo helpers shared by the Add item form and the item page.
import imageCompression from "browser-image-compression";
import type { Area } from "react-easy-crop";
import { cropToFile, padToSquare } from "./crop-dialog";
import { removeBackgroundToSquare } from "./remove-background";

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

export const BACKGROUND_FAILED = "Couldn't remove the background, so the photo was kept as it is.";

// Crop (or keep the whole photo), optionally cut the piece out, then shrink.
// If removing the background fails, the photo is still used as it is.
export async function preparePhoto(file: File, src: string, area: Area | null, removeBg: boolean) {
  let chosen = area ? await cropToFile(file, src, area) : await padToSquare(file, src);
  let backgroundFailed = false;
  if (removeBg) {
    try {
      chosen = await removeBackgroundToSquare(chosen);
    } catch {
      backgroundFailed = true;
    }
  }
  return { file: await shrink(chosen), backgroundFailed };
}
