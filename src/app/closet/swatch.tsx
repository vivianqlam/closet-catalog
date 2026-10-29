// Stand-in when an item has no photo: a circle filled
// with the item's color when the browser knows that color name ("navy",
// "Olive", "Light Blue"), and a neutral circle when it doesn't.
const SIZES = { sm: "size-6", md: "size-20", lg: "size-40" };

export function Swatch({ color, size = "md" }: { color: string | null; size?: "sm" | "md" | "lg" }) {
  const cssColor = color?.toLowerCase().replace(/\s+/g, "");
  return (
    <span
      aria-hidden
      className={`block rounded-full border border-ink/10 bg-line ${SIZES[size]}`}
      style={cssColor ? { backgroundColor: cssColor } : undefined}
    />
  );
}
