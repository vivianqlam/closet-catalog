// Which line drawing a piece without a photo gets (Issue #52).
//
// In plain English: the drawing should look like the actual piece, so the
// item's name wins over its category when the name is clearer.
import { describe, expect, it } from "vitest";
import { sketchShape } from "@/app/closet/item-sketch";

describe("sketchShape", () => {
  it.each([
    [7, "Swiftly Tech Long-Sleeve Shirt 2.0", "LongSleeve"],
    [7, "All Day Breeze Bra", "SportsBra"],
    [7, 'Speed Up High-Rise Short 4"', "Shorts"],
    [7, 'Wunder Train High-Rise Tight 25"', "Leggings"],
    [7, "Match Point Tennis Skirt", "Skirt"],
    [1, "Ribbed Merino Wool Turtleneck Sweater", "LongSleeve"],
    [1, "Sculpt Knit Criss Cross Tank", "Tank"],
    [1, "Dolman sleeve button down shirt in cotton poplin", "Tops"],
    [4, "The Slouch Coat", "Outerwear"],
    [4, "The Super Puff Long", "Puffer"],
    [4, "1996 Retro Nuptse Vest", "Vest"],
    [5, "Rollers Sandals", "Sandal"],
    [5, "Slim Flip Flops", "Sandal"],
    [5, "Nylah Nappa Knee Boot", "Boot"],
    [5, "Petunia Heeled Sandal", "Sandal"],
    [5, "Alex W Loafer", "Flat"],
    [5, "Handball Spezial", "Shoes"],
    [6, "Everywhere Belt Bag", "BeltBag"],
    [6, "Unisex Classic Ball Cap", "Hat"],
    [6, "Performance Conquer Headband", "Headband"],
    [1, "Vinca Mira Bikini", "Bikini"],
  ])("category %i, %s → %s", (category, name, shape) => {
    expect(sketchShape(category, name)).toBe(shape);
  });

  it("falls back to the category when the name doesn't say", () => {
    expect(sketchShape(7, "Airlift Intrigue")).toBe("Tank");
    expect(sketchShape(4, "Caldwell")).toBe("Outerwear");
    expect(sketchShape(null, "Mystery piece")).toBe("Tops");
  });
});
