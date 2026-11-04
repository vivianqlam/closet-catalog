// Stand-in when an item has no photo: a simple line drawing of what kind of
// piece it is, outlined in oxblood and filled with the item's color when the
// browser knows that color name ("navy", "Black"). Unknown colors stay cream.

const CATEGORY_IDS: Record<number, string> = {
  1: "Tops", 2: "Bottoms", 3: "Dresses", 4: "Outerwear", 5: "Shoes", 6: "Accessories", 7: "Activewear",
};

// One outline per kind of piece, drawn on a 120 × 120 grid. The first path is
// filled with the item's color; any others are detail lines.
const SHAPES: Record<string, string[]> = {
  Tops: ["M34 22 L48 14 Q60 24 72 14 L86 22 L102 40 L88 50 L84 44 L84 104 L36 104 L36 44 L32 50 L18 40 Z"],
  LongSleeve: ["M40 18 L50 12 Q60 20 70 12 L80 18 L100 36 L106 98 L94 100 L86 50 L84 106 L36 106 L34 50 L26 100 L14 98 L20 36 Z"],
  Tank: ["M44 14 L50 14 Q60 30 70 14 L76 14 L80 44 Q86 52 84 106 H36 Q34 52 40 44 Z"],
  SportsBra: ["M36 34 L44 16 L50 16 Q60 38 70 16 L76 16 L84 34 L86 66 H34 Z", "M34 56 H86"],
  Bottoms: ["M38 14 H82 L90 106 H66 L60 52 L54 106 H30 Z", "M37 26 H83"],
  Leggings: ["M44 12 H76 L80 108 H66 L60 40 L54 108 H40 Z", "M43 22 H77"],
  Shorts: ["M34 34 H86 L92 86 H66 L60 60 L54 86 H28 Z", "M33 44 H87"],
  Skirt: ["M42 22 H78 L94 96 H26 Z", "M42 32 H78"],
  Dresses: ["M46 12 L54 12 L56 28 Q60 32 64 28 L66 12 L74 12 L76 40 L96 106 H24 L44 40 Z"],
  Outerwear: ["M36 16 L50 10 L60 40 L70 10 L84 16 L100 34 L96 110 H24 L20 34 Z", "M60 40 V110"],
  Puffer: ["M36 14 L52 10 Q60 16 68 10 L84 14 L100 32 L98 110 H22 L20 32 Z", "M22 44 H98", "M22 66 H98", "M22 88 H98", "M60 16 V110"],
  Vest: ["M42 12 L52 12 Q60 24 68 12 L78 12 L80 34 Q90 40 92 50 V108 H28 V50 Q30 40 40 34 Z", "M60 24 V108", "M28 66 H92", "M28 86 H92"],
  Shoes: ["M12 82 Q14 64 32 62 L56 60 Q68 60 76 68 L100 74 Q110 78 108 90 H14 Q10 88 12 82 Z", "M14 90 H108"],
  Boot: ["M36 14 H64 L66 70 Q92 72 100 84 L102 100 H34 Z", "M34 92 H102"],
  Sandal: ["M20 72 Q20 58 60 58 Q100 58 100 72 Q100 86 60 86 Q20 86 20 72 Z", "M44 60 Q60 40 76 60"],
  Heel: ["M18 88 L66 66 L94 66 L100 72 L98 104 H90 L88 80 L24 98 Z"],
  Flat: ["M14 84 Q14 68 34 66 L80 66 Q104 66 106 84 Q106 92 96 92 H22 Q14 92 14 84 Z", "M52 66 Q60 76 70 66"],
  Accessories: ["M28 50 H92 L98 104 H22 Z", "M44 50 Q44 26 60 26 Q76 26 76 50"],
  BeltBag: ["M18 56 Q18 44 30 44 H90 Q102 44 102 56 V76 Q102 88 90 88 H30 Q18 88 18 76 Z", "M4 62 H18", "M102 62 H116", "M30 56 H90"],
  Hat: ["M26 76 Q26 36 60 36 Q94 36 94 76 Z", "M14 76 H106"],
  Headband: ["M16 74 Q60 24 104 74 L96 78 Q60 40 24 78 Z"],
  Bikini: ["M30 38 Q44 32 58 48 L44 56 Q34 52 30 38 Z", "M90 38 Q76 32 62 48 L76 56 Q86 52 90 38 Z", "M34 72 H86 L72 98 H48 Z", "M30 38 L44 18", "M90 38 L76 18"],
};

// Each category's drawing when the name doesn't say more.
const CATEGORY_SHAPES: Record<string, string> = { Activewear: "Tank" };

// The name beats the category when it's clearer: "Swiftly Tech Long-Sleeve
// Shirt" draws long sleeves, "Speed Up Short" draws shorts, "Nuptse Vest" a
// vest. The first match wins, so the more specific words come first.
const NAME_SHAPES: [RegExp, string][] = [
  [/\bheadband\b/i, "Headband"],
  [/\bbelt bag\b|\bfanny\b/i, "BeltBag"],
  [/\b(cap|hat|beanie)\b/i, "Hat"],
  [/\b(bikini|swim\w*)\b/i, "Bikini"],
  [/\bvest\b/i, "Vest"],
  [/\b(puff\w*|nuptse)\b|\bdown (jacket|coat|parka)\b/i, "Puffer"],
  [/\b(bra|bralette)\b/i, "SportsBra"],
  [/long[- ]sleeve|turtleneck|sweater|cardigan|quarter zip|hoodie|sweatshirt|crewneck/i, "LongSleeve"],
  [/\b(tank|cami\w*|halter|strapless|tube|bodysuit)\b/i, "Tank"],
  [/\b(skirt|skort)\b/i, "Skirt"],
  [/\bshorts?\b/i, "Shorts"],
  [/\b(tights?|leggings?)\b/i, "Leggings"],
  [/\b(pants?|jeans?|trousers|sweatpant|cargo|crop)\b/i, "Bottoms"],
  [/\b(dress)\b/i, "Dresses"],
  [/\b(blazer|jacket|coat|trench|parka)\b/i, "Outerwear"],
  [/\bboots?\b/i, "Boot"],
  [/\b(sandals?|flip[- ]?flops?|slides?|mules?)\b/i, "Sandal"],
  [/\b(heels?|heeled|pumps?)\b/i, "Heel"],
  [/\b(loafers?|flats?|ballet|mary janes?)\b/i, "Flat"],
  [/\b(sneakers?|shoes?|trainers?|runners?|samba|spezial)\b/i, "Shoes"],
  [/\b(t-?shirt|tee|shirt|top|blouse|button[- ]down)\b/i, "Tops"],
  [/\b(bag|tote|purse|clutch|crossbody)\b/i, "Accessories"],
];

// Which drawing a piece gets: from its name if that's clear, else its category.
export function sketchShape(category?: number | string | null, name?: string): string {
  const fromName = name ? NAME_SHAPES.find(([pattern]) => pattern.test(name))?.[1] : undefined;
  const categoryName = typeof category === "number" ? CATEGORY_IDS[category] : category;
  const fromCategory = categoryName ? (CATEGORY_SHAPES[categoryName] ?? categoryName) : undefined;
  const shape = fromName ?? fromCategory;
  return shape && shape in SHAPES ? shape : "Tops";
}

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
  const paths = SHAPES[sketchShape(category, name)];
  const cssColor = color?.toLowerCase().replace(/\s+/g, "");
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={`h-auto ${SIZES[size]}`}>
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          // An unknown color name is ignored in `style`, so the cream `fill` shows instead.
          // Closed outlines (ending in Z) are filled; open ones are detail lines.
          fill={d.endsWith("Z") ? "#fbf5f2" : "none"}
          style={d.endsWith("Z") && cssColor ? { fill: cssColor } : undefined}
          stroke="var(--accent)"
          strokeWidth={size === "sm" ? 5 : 2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
