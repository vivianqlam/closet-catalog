// Cuts the clothing out of a photo, in the browser, so it sits on the app's
// tile color like the rest of the closet (Issue #50). Uses the open-source
// @imgly/background-removal model (AGPL-3.0); the model downloads once
// (about 40 MB) and is cached by the browser after that.

const SIDE = 1000; // finished photos are 1000 × 1000
const FILL = 0.88; // the piece takes up 88% of the square

// Returns a square, see-through PNG with the piece centered.
export async function removeBackgroundToSquare(file: File): Promise<File> {
  const { removeBackground } = await import("@imgly/background-removal");
  const cutOut = await removeBackground(file, {
    model: "isnet_quint8",
    output: { format: "image/png" },
  });

  const src = URL.createObjectURL(cutOut);
  try {
    const image = new Image();
    image.src = src;
    await image.decode();

    // Find the piece: the box around every pixel that isn't see-through.
    const { naturalWidth: w, naturalHeight: h } = image;
    const scan = document.createElement("canvas");
    scan.width = w;
    scan.height = h;
    const sctx = scan.getContext("2d")!;
    sctx.drawImage(image, 0, 0);
    const alpha = sctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (alpha[(y * w + x) * 4 + 3] > 24) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) throw new Error("Couldn't find the clothing in that photo.");

    // Center it on a square, see-through canvas.
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    const scale = (SIDE * FILL) / Math.max(boxW, boxH);
    const canvas = document.createElement("canvas");
    canvas.width = SIDE;
    canvas.height = SIDE;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      minX, minY, boxW, boxH,
      (SIDE - boxW * scale) / 2, (SIDE - boxH * scale) / 2, boxW * scale, boxH * scale,
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Couldn't prepare that photo.");
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".png", { type: "image/png" });
  } finally {
    URL.revokeObjectURL(src);
  }
}
