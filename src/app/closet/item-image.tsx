import { ItemSketch } from "./item-sketch";

// The file name is in the link's path, before any "?token=…".
function isPng(src: string) {
  try {
    return new URL(src).pathname.toLowerCase().endsWith(".png");
  } catch {
    return false;
  }
}

// What fills an item's tile: an uploaded photo, a product image link, or
// (with neither) a line drawing of the piece. The parent must be "relative".
export function ItemImage({
  uploadedSrc,
  linkSrc,
  color,
  category,
  name,
  alt,
  size = "md",
  addPhotoHint = false,
}: {
  uploadedSrc?: string | null;
  linkSrc?: string | null;
  color: string | null;
  category?: number | string | null; // category id or name, picks the drawing
  name?: string; // the item's name, which can pick a better drawing
  alt: string;
  size?: "sm" | "md" | "lg";
  addPhotoHint?: boolean; // show "+ Add photo" on the drawing (closet grid)
}) {
  if (uploadedSrc) {
    // Fit the whole photo inside the tile (Issue #46). Photos with a solid
    // background are blended into the tile, so white melts into the tile color
    // and light gray becomes a slightly deeper tone (Issue #50). See-through
    // PNGs (our cut-outs) already show the tile, so they're left as they are.
    const blend = isPng(uploadedSrc) ? "" : " mix-blend-multiply";
    // eslint-disable-next-line @next/next/no-img-element -- signed links from a private bucket
    return <img src={uploadedSrc} alt={alt} className={`absolute inset-0 size-full object-contain${blend}`} />;
  }
  if (linkSrc) {
    // Product shots are usually on white; "multiply" drops the white into the
    // tile color so the piece looks cut out (the trick from tandpfun/wardrobe).
    return (
      // eslint-disable-next-line @next/next/no-img-element -- links can point at any store's website
      <img
        src={linkSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply"
      />
    );
  }
  return (
    <>
      <ItemSketch category={category} name={name} color={color} size={size} />
      {addPhotoHint && (
        <span className="absolute bottom-2 left-2 rounded-full bg-paper/90 px-2.5 py-0.5 text-xs font-medium text-accent">
          + Add photo
        </span>
      )}
    </>
  );
}
