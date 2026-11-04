// Cuts the clothing out of a photo, in the browser, so it sits on the app's
// tile color like the rest of the closet (Issue #50). Uses the open-source
// @imgly/background-removal model (AGPL-3.0); the model downloads once
// (about 80 MB) and is cached by the browser after that.

const SIDE = 1000; // finished photos are 1000 × 1000
const FILL = 0.88; // the piece takes up 88% of the square

// Returns a square, see-through PNG with the piece centered.
export async function removeBackgroundToSquare(file: File): Promise<File> {
  const { removeBackground } = await import("@imgly/background-removal");
  const cutOut = await removeBackground(file, {
    // The standard model: the smaller "quint8" one left a gray haze (Issue #54).
    model: "isnet_fp16",
    output: { format: "image/png" },
  });

  const src = URL.createObjectURL(cutOut);
  try {
    const image = new Image();
    image.src = src;
    await image.decode();

    const { naturalWidth: w, naturalHeight: h } = image;
    const scan = document.createElement("canvas");
    scan.width = w;
    scan.height = h;
    const sctx = scan.getContext("2d")!;
    sctx.drawImage(image, 0, 0);
    const pixels = sctx.getImageData(0, 0, w, h);
    cleanUp(pixels.data, w, h);
    sctx.putImageData(pixels, 0, 0);
    const alpha = pixels.data;

    // Find the piece: the box around every pixel that isn't see-through.
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
      scan,
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

// Tidies the model's result in place (Issue #54): faint, half see-through
// leftovers of the backdrop are cleared, edges stay soft, and small specks
// that aren't attached to the piece are removed.
function cleanUp(data: Uint8ClampedArray, w: number, h: number) {
  const LOW = 60; // at or below this, treat as background
  const HIGH = 200; // at or above this, treat as solid
  const solid = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const a = data[p * 4 + 3];
    const next = a <= LOW ? 0 : a >= HIGH ? 255 : Math.round(((a - LOW) / (HIGH - LOW)) * 255);
    data[p * 4 + 3] = next;
    if (next >= 128) solid[p] = 1;
  }

  // Group touching solid pixels into islands, and keep islands at least 2% the
  // size of the biggest one (two shoes in one photo are both kept).
  const island = new Int32Array(w * h).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let p = 0; p < w * h; p++) {
    if (!solid[p] || island[p] >= 0) continue;
    const id = sizes.length;
    let size = 0;
    island[p] = id;
    stack.push(p);
    while (stack.length) {
      const q = stack.pop()!;
      size++;
      const x = q % w;
      const neighbors = [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, q - w, q + w];
      for (const r of neighbors) {
        if (r >= 0 && r < w * h && solid[r] && island[r] < 0) {
          island[r] = id;
          stack.push(r);
        }
      }
    }
    sizes.push(size);
  }
  const biggest = Math.max(0, ...sizes);
  const kept = sizes.map((size) => size >= biggest * 0.02);

  // Clear everything not on a kept island, except soft edge pixels right next to one.
  for (let p = 0; p < w * h; p++) {
    if (!data[p * 4 + 3] || (island[p] >= 0 && kept[island[p]])) continue;
    const x = p % w;
    const y = (p - x) / w;
    let nearKept = false;
    for (let dy = -2; dy <= 2 && !nearKept; dy++) {
      for (let dx = -2; dx <= 2 && !nearKept; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const r = yy * w + xx;
        if (island[r] >= 0 && kept[island[r]]) nearKept = true;
      }
    }
    if (!nearKept) data[p * 4 + 3] = 0;
  }
}
