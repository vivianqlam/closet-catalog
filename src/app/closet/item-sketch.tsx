// Stand-in when an item has no photo: a simple line drawing of what kind of
// piece it is, outlined in oxblood and filled with the item's color when the
// browser knows that color name ("navy", "Black"). Unknown colors stay cream.

const CATEGORY_IDS: Record<number, string> = {
  1: "Tops", 2: "Bottoms", 3: "Dresses", 4: "Outerwear", 5: "Shoes", 6: "Accessories", 7: "Activewear",
};

// One outline per category, drawn on a 120 × 120 grid.
const SHAPES: Record<string, string[]> = {
  Tops: ["M34 22 L48 14 Q60 24 72 14 L86 22 L102 40 L88 50 L84 44 L84 104 L36 104 L36 44 L32 50 L18 40 Z"],
  Bottoms: ["M38 14 H82 L90 106 H66 L60 52 L54 106 H30 Z", "M37 26 H83"],
  Dresses: ["M46 12 L54 12 L56 28 Q60 32 64 28 L66 12 L74 12 L76 40 L96 106 H24 L44 40 Z"],
  Outerwear: ["M36 16 L50 10 L60 40 L70 10 L84 16 L100 34 L96 110 H24 L20 34 Z", "M60 40 V110"],
  Shoes: ["M12 82 Q14 64 32 62 L56 60 Q68 60 76 68 L100 74 Q110 78 108 90 H14 Q10 88 12 82 Z"],
  Accessories: ["M28 50 H92 L98 104 H22 Z", "M44 50 Q44 26 60 26 Q76 26 76 50"],
  Activewear: ["M40 16 L48 16 Q60 34 72 16 L80 16 L84 46 Q86 70 80 104 H40 Q34 70 36 46 Z"],
  Shorts: ["M34 34 H86 L92 86 H66 L60 60 L54 86 H28 Z", "M33 44 H87"],
  Hat: ["M26 76 Q26 36 60 36 Q94 36 94 76 Z", "M14 76 H106"],
};

// The name beats the category when it's clearer, so "Speed Up Short" in
// Activewear draws shorts and a cap in Accessories draws a hat.
const NAME_SHAPES: [RegExp, string][] = [
  [/\b(cap|hat|beanie)\b/i, "Hat"],
  [/\bshorts?\b|\bskort\b/i, "Shorts"],
  [/\b(tights?|leggings?|pants?|jeans?|trousers|sweatpant)\b/i, "Bottoms"],
  [/\b(bra|bralette|tank)\b/i, "Activewear"],
  [/\b(dress)\b/i, "Dresses"],
  [/\b(sandals?|boots?|shoes?|sneakers?|loafers?|flats?|heels?)\b/i, "Shoes"],
  [/\b(bag|tote|purse)\b/i, "Accessories"],
];

const SIZES = { sm: "w-[70%]", md: "w-[55%]", lg: "w-[45%]" };

export function ItemSketch({
  category,
  name,
  color,
  size = "md",
}: {
  category?: number | string | null;
  name?: string;
  color: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const fromName = name ? NAME_SHAPES.find(([pattern]) => pattern.test(name))?.[1] : undefined;
  const fromCategory = typeof category === "number" ? CATEGORY_IDS[category] : category;
  const paths = SHAPES[fromName ?? fromCategory ?? ""] ?? SHAPES.Tops;
  const cssColor = color?.toLowerCase().replace(/\s+/g, "");
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={`h-auto ${SIZES[size]}`}>
      {paths.map((d, i) => (
        <path
          key={d}
          d={d}
          // An unknown color name is ignored in `style`, so the cream `fill` shows instead.
          fill={i === 0 ? "#fbf5f2" : "none"}
          style={i === 0 && cssColor ? { fill: cssColor } : undefined}
          stroke="var(--accent)"
          strokeWidth={size === "sm" ? 5 : 2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
