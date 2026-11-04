// The "Style me" outfit builder's row logic (Issue #39).
//
// In plain English: the arrows wrap around (after the last top comes the
// first), "Surprise me" always lands on a different piece when there's more
// than one, and jackets only join the Top row when Outerwear is switched on.
import { describe, expect, it } from "vitest";
import { outfitRows, randomIndex, stepIndex, type StyleItem } from "@/lib/style";

const piece = (id: string, category_id: number): StyleItem => ({
  id,
  name: id,
  brand: null,
  color: null,
  category_id,
  photoSrc: null,
  photo_url: null,
});

const closet = [piece("tee", 1), piece("jeans", 2), piece("blazer", 4), piece("loafers", 5), piece("scarf", 6)];

describe("style me", () => {
  it("puts outerwear in the Top row only when switched on", () => {
    expect(outfitRows(closet, false).top.map((i) => i.id)).toEqual(["tee"]);
    expect(outfitRows(closet, true).top.map((i) => i.id)).toEqual(["tee", "blazer"]);
    expect(outfitRows(closet, true).bottom.map((i) => i.id)).toEqual(["jeans"]);
    expect(outfitRows(closet, true).shoes.map((i) => i.id)).toEqual(["loafers"]);
  });

  it("wraps the arrows around both ends", () => {
    expect(stepIndex(2, 1, 3)).toBe(0);
    expect(stepIndex(0, -1, 3)).toBe(2);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });

  it("never shuffles onto the piece already showing", () => {
    for (let current = 0; current < 4; current++) {
      for (const r of [0, 0.3, 0.6, 0.999]) {
        const pick = randomIndex(4, current, () => r);
        expect(pick).not.toBe(current);
        expect(pick).toBeGreaterThanOrEqual(0);
        expect(pick).toBeLessThan(4);
      }
    }
    expect(randomIndex(1, 0)).toBe(0);
  });
});
