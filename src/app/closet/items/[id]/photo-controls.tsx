"use client";

import imageCompression from "browser-image-compression";
import { useActionState, useRef, useState, useTransition } from "react";
import type { Area } from "react-easy-crop";
import { removePhoto, setPhotoUrl, uploadPhoto, type PhotoState } from "../photo-actions";
import { CropDialog, cropToFile } from "./crop-dialog";

// Shrink big phone photos in the browser before they're sent anywhere.
async function shrink(file: File) {
  const fileType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    fileType,
    useWebWorker: true,
  });
}

export function PhotoControls({ itemId, hasPhoto }: { itemId: string; hasPhoto: boolean }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string>();
  const [uploading, startUpload] = useTransition();
  const [removing, startRemove] = useTransition();
  const [showLink, setShowLink] = useState(false);
  const [linkState, linkAction, savingLink] = useActionState(
    async (prev: PhotoState, formData: FormData) => {
      const result = await setPhotoUrl(itemId, prev, formData);
      if (!result.error) setShowLink(false);
      return result;
    },
    {},
  );

  // The photo waiting in the crop box (it stays on your device until you save).
  const [picked, setPicked] = useState<{ file: File; src: string } | null>(null);

  const clearPicked = () => {
    if (picked) URL.revokeObjectURL(picked.src);
    setPicked(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(undefined);
    const src = URL.createObjectURL(file);
    try {
      // Make sure this browser can open the photo before showing the crop box.
      const test = new Image();
      test.src = src;
      await test.decode();
      setPicked({ file, src });
    } catch {
      URL.revokeObjectURL(src);
      setUploadError("Couldn't read that photo. Please try a JPG or PNG.");
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onCropped = (area: Area | null) => {
    if (!picked) return;
    const { file, src } = picked;
    setPicked(null);
    startUpload(async () => {
      try {
        const chosen = area ? await cropToFile(file, src, area) : file;
        const small = await shrink(chosen);
        const formData = new FormData();
        formData.set("photo", small, small.name || "photo");
        const result = await uploadPhoto(itemId, formData);
        if (result.error) setUploadError(result.error);
      } catch {
        setUploadError("Couldn't read that photo. Please try a JPG or PNG.");
      } finally {
        URL.revokeObjectURL(src);
        if (fileInput.current) fileInput.current.value = "";
      }
    });
  };

  const buttonClass = "rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink disabled:opacity-60";
  const busy = uploading || removing || savingLink;
  const error = uploadError ?? linkState.error;

  return (
    <div className="mt-6">
      {picked && <CropDialog src={picked.src} onDone={onCropped} onCancel={clearPicked} />}
      <p className="label">Photo</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {/* Opens your phone's camera / photo picker. Only the photo you pick is sent. */}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="sr-only"
          id="photo-file"
          onChange={(event) => onPick(event.target.files?.[0])}
        />
        <label htmlFor="photo-file" className={`${buttonClass} cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? "Uploading…" : hasPhoto ? "Replace photo" : "Upload photo"}
        </label>
        <button type="button" disabled={busy} onClick={() => setShowLink((open) => !open)} className={buttonClass}>
          Paste image link
        </button>
        {hasPhoto && (
          <button
            type="button"
            disabled={busy}
            onClick={() => startRemove(() => removePhoto(itemId))}
            className={`${buttonClass} text-accent`}
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        )}
      </div>

      {showLink && (
        <form action={linkAction} className="mt-3 flex gap-2">
          <label htmlFor="photo_url" className="sr-only">
            Image link
          </label>
          <input
            id="photo_url"
            name="photo_url"
            type="url"
            required
            placeholder="https://store.com/product.jpg"
            className="min-w-0 flex-1 border border-line bg-transparent px-3 py-1.5 text-sm focus:border-ink focus:outline-none"
          />
          <button type="submit" disabled={busy} className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60">
            {savingLink ? "Saving…" : "Save"}
          </button>
        </form>
      )}
      {showLink && (
        <p className="mt-1 text-xs text-muted">
          Tip: on a store&apos;s product page, right-click the photo and choose &ldquo;Copy Image Address.&rdquo;
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
