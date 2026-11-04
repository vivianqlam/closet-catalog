// Helpers for the "Style me" outfit builder (Issue #39). Kept apart from the
// page so they can be tested without a browser.

export const TOP_CATEGORY = 1;
export const BOTTOM_CATEGORY = 2;
export const OUTERWEAR_CATEGORY = 4;
export const SHOES_CATEGORY = 5;

export type StyleItem = {
  id: string;
  name: string;
  brand: string | null;
  color: string | null;
  category_id: number;
  photoSrc: string | null; // signed link to an uploaded photo
  photo_url: string | null; // product image link
};

// Splits the closet into the three rows. Outerwear joins the Top row only
// when it's switched on.
export function outfitRows(items: StyleItem[], includeOuterwear: boolean) {
  const topIds = includeOuterwear ? [TOP_CATEGORY, OUTERWEAR_CATEGORY] : [TOP_CATEGORY];
  return {
    top: items.filter((item) => topIds.includes(item.category_id)),
    bottom: items.filter((item) => item.category_id === BOTTOM_CATEGORY),
    shoes: items.filter((item) => item.category_id === SHOES_CATEGORY),
  };
}

// Moves one step forward or back, wrapping around at either end
// (after the last item comes the first again).
export function stepIndex(index: number, step: number, length: number) {
  if (length === 0) return 0;
  return (((index + step) % length) + length) % length;
}

// Picks a random position, avoiding the current one when there's a choice,
// so "Surprise me" always changes something you can see.
export function randomIndex(length: number, current: number, random = Math.random) {
  if (length <= 1) return 0;
  const pick = Math.floor(random() * (length - 1));
  return pick >= current ? pick + 1 : pick;
}
