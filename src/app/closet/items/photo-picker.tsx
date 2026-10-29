"use client";

import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { CropDialog, cropToFile } from "./crop-dialog";
import { UNREADABLE_PHOTO, openPhoto, shrink } from "./photo-tools";

export type PickedPhoto = { file: File; preview: string };

// Optional photo on the Add item form: pick, frame it in the crop box, and
// see a preview. Nothing is uploaded until the item itself is saved.
export function PhotoPicker({
  value,
  onChange,
}: {
  value: PickedPhoto | null;
  onChange: (photo: PickedPhoto | null) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [cropping, setCropping] = useState<{ file: File; src: string } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>();

  const reset = () => {
    if (fileInput.current) fileInput.current.value = "";
  };

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setError(undefined);
    const src = await openPhoto(file);
    if (src) setCropping({ file, src });
    else {
      setError(UNREADABLE_PHOTO);
      reset();
    }
  };

  const onCropped = async (area: Area | null) => {
    if (!cropping) return;
    const { file, src } = cropping;
    setCropping(null);
    setWorking(true);
    try {
      const chosen = area ? await cropToFile(file, src, area) : file;
      const small = await shrink(chosen);
      const ready = new File([small], small.name || "photo", { type: small.type });
      if (value) URL.revokeObjectURL(value.preview);
      onChange({ file: ready, preview: URL.createObjectURL(ready) });
    } catch {
      setError(UNREADABLE_PHOTO);
    } finally {
      URL.revokeObjectURL(src);
      setWorking(false);
      reset();
    }
  };

  const remove = () => {
    if (value) URL.revokeObjectURL(value.preview);
    onChange(null);
  };

  const buttonClass = "rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink";

  return (
    <div>
      {cropping && (
        <CropDialog
          src={cropping.src}
          onDone={onCropped}
          onCancel={() => {
            URL.revokeObjectURL(cropping.src);
            setCropping(null);
            reset();
          }}
        />
      )}
      <p className="label">Photo (optional)</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden bg-tile">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of the picked photo
            <img src={value.preview} alt="Selected photo" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="text-xs text-muted">{working ? "Preparing…" : "No photo"}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Opens your phone's camera / photo picker. Only the photo you pick is used. */}
          <input
            ref={fileInput}
            id="new-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onPick(event.target.files?.[0])}
          />
          <label htmlFor="new-photo" className={`${buttonClass} cursor-pointer`}>
            {value ? "Change photo" : "Add photo"}
          </label>
          {value && (
            <button type="button" onClick={remove} className={`${buttonClass} text-accent`}>
              Remove
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
