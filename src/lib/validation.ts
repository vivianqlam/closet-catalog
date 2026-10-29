// Checks a submitted item form and turns it into a row for the items table.
// Kept free of Next.js and Supabase so it can be unit tested on its own.
import { FORMALITIES, SEASONS, type Formality, type Season } from "./types";

export const NAME_MAX = 80;
export const TEXT_MAX = 60;
export const NOTES_MAX = 500;

export type ItemField = "name" | "category_id" | "color" | "season" | "formality" | "brand" | "notes";
export type ItemValues = Record<ItemField, string>;
export type ItemErrors = Partial<Record<ItemField, string>>;

export type ItemRow = {
  name: string;
  category_id: number;
  color: string | null;
  season: Season;
  formality: Formality | null;
  brand: string | null;
  notes: string | null;
};

const FIELDS: ItemField[] = ["name", "category_id", "color", "season", "formality", "brand", "notes"];

export function readItemValues(formData: FormData): ItemValues {
  return Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "").trim()]),
  ) as ItemValues;
}

export function validateItem(
  values: ItemValues,
): { ok: true; row: ItemRow } | { ok: false; errors: ItemErrors } {
  const errors: ItemErrors = {};
  const categoryId = Number(values.category_id);

  if (!values.name) errors.name = "Please give this item a name.";
  else if (values.name.length > NAME_MAX)
    errors.name = `Please keep the name under ${NAME_MAX} characters.`;

  if (!Number.isInteger(categoryId) || categoryId <= 0)
    errors.category_id = "Please choose a category.";

  if (!SEASONS.includes(values.season as Season)) errors.season = "Please choose a season.";

  if (values.formality && !FORMALITIES.includes(values.formality as Formality))
    errors.formality = "Please choose a formality from the list.";

  if (values.color.length > TEXT_MAX)
    errors.color = `Please keep the color under ${TEXT_MAX} characters.`;
  if (values.brand.length > TEXT_MAX)
    errors.brand = `Please keep the brand under ${TEXT_MAX} characters.`;
  if (values.notes.length > NOTES_MAX)
    errors.notes = `Please keep notes under ${NOTES_MAX} characters.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    row: {
      name: values.name,
      category_id: categoryId,
      color: values.color || null,
      season: values.season as Season,
      formality: (values.formality || null) as Formality | null,
      brand: values.brand || null,
      notes: values.notes || null,
    },
  };
}
