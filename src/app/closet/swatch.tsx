// Stand-in for a photo until photo upload lands (feature 8): a circle filled
// with the item's color when the browser knows that color name ("navy",
// "Olive", "Light Blue"), and a neutral circle when it doesn't.
export function Swatch({ color, size = "md" }: { color: string | null; size?: "md" | "lg" }) {
  const cssColor = color?.toLowerCase().replace(/\s+/g, "");
  return (
    <span
      aria-hidden
      className={`block rounded-full border border-ink/10 bg-line ${size === "lg" ? "size-40" : "size-20"}`}
      style={cssColor ? { backgroundColor: cssColor } : undefined}
    />
  );
}
