import { Swatch } from "./swatch";

// What fills an item's tile: an uploaded photo, a product image link, or
// (with neither) a circle in the item's color. The parent must be "relative".
export function ItemImage({
  uploadedSrc,
  linkSrc,
  color,
  alt,
  size = "md",
}: {
  uploadedSrc?: string | null;
  linkSrc?: string | null;
  color: string | null;
  alt: string;
  size?: "md" | "lg";
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
  return <Swatch color={color} size={size} />;
}
