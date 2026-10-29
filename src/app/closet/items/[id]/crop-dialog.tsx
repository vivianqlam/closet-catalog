"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

// Cuts the chosen square out of the photo, in the browser, before anything is uploaded.
export async function cropToFile(file: File, src: string, area: Area): Promise<File> {
  const image = new Image();
  image.src = src;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  canvas
    .getContext("2d")!
    .drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error("Couldn't crop that photo.");
  return new File([blob], file.name, { type });
}

// Shows the picked photo with a square box (the same shape as the closet
// tiles) that you drag and zoom to frame just the clothing.
export function CropDialog({
  src,
  onDone,
  onCancel,
}: {
  src: string;
  onDone: (area: Area | null) => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const buttonClass = "rounded-full border border-line px-4 py-2 text-sm hover:border-ink";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="crop-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,520px)] border border-line bg-paper p-5 text-ink backdrop:bg-ink/50"
    >
      <h2 id="crop-title" className="text-lg font-medium">
        Frame the clothing
      </h2>
      <p className="mt-1 text-sm text-muted">
        Drag the photo and zoom so the square shows just this piece. Only what&apos;s inside the
        square is saved.
      </p>

      <div className="relative mt-4 h-72 bg-ink sm:h-80">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          maxZoom={5}
          aspect={1}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
        />
      </div>

      <label className="mt-4 flex items-center gap-3">
        <span className="label">Zoom</span>
        <input
          type="range"
          min={1}
          max={5}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="flex-1 accent-ink"
        />
      </label>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className={buttonClass}>
          Cancel
        </button>
        <button type="button" onClick={() => onDone(null)} className={buttonClass}>
          Use whole photo
        </button>
        <button
          type="button"
          disabled={!area}
          onClick={() => onDone(area)}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60"
        >
          Save photo
        </button>
      </div>
    </dialog>
  );
}
