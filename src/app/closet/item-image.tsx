import { ItemSketch } from "./item-sketch";

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
    // Phone photos fill the tile.
    // eslint-disable-next-line @next/next/no-img-element -- signed links from a private bucket
    return <img src={uploadedSrc} alt={alt} className="absolute inset-0 size-full object-cover" />;
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
