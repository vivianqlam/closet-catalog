// Checks a submitted item form and turns it into a row for the items table.
// Kept free of Next.js and Supabase so it can be unit tested on its own.
import {
  CLIMATES,
  FORMALITIES,
  SEASONS,
  TRIP_TYPES,
  type Climate,
  type Formality,
  type Season,
  type TripType,
} from "./types";

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

// ── Trips ───────────────────────────────────────────────────────────────

export type TripField = "name" | "destination" | "start_date" | "end_date" | "climate" | "trip_type";
export type TripValues = Record<TripField, string>;
export type TripErrors = Partial<Record<TripField, string>>;

export type TripRow = {
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  climate: Climate | null;
  trip_type: TripType | null;
};

const TRIP_FIELDS: TripField[] = ["name", "destination", "start_date", "end_date", "climate", "trip_type"];

export function readTripValues(formData: FormData): TripValues {
  return Object.fromEntries(
    TRIP_FIELDS.map((field) => [field, String(formData.get(field) ?? "").trim()]),
  ) as TripValues;
}

// A real calendar date written as YYYY-MM-DD (what date pickers send).
const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

export function validateTrip(
  values: TripValues,
): { ok: true; row: TripRow } | { ok: false; errors: TripErrors } {
  const errors: TripErrors = {};

  if (!values.name) errors.name = "Please give this trip a name.";
  else if (values.name.length > NAME_MAX)
    errors.name = `Please keep the name under ${NAME_MAX} characters.`;

  if (values.destination.length > NAME_MAX)
    errors.destination = `Please keep the destination under ${NAME_MAX} characters.`;

  if (values.start_date && !isDate(values.start_date)) errors.start_date = "Please pick a real date.";
  if (values.end_date && !isDate(values.end_date)) errors.end_date = "Please pick a real date.";
  // Dates in YYYY-MM-DD form sort correctly as plain text.
  if (!errors.start_date && !errors.end_date && values.start_date && values.end_date &&
      values.end_date < values.start_date)
    errors.end_date = "The trip can't end before it starts.";

  if (values.climate && !CLIMATES.includes(values.climate as Climate))
    errors.climate = "Please choose a climate from the list.";
  if (values.trip_type && !TRIP_TYPES.includes(values.trip_type as TripType))
    errors.trip_type = "Please choose a trip type from the list.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    row: {
      name: values.name,
      destination: values.destination || null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      climate: (values.climate || null) as Climate | null,
      trip_type: (values.trip_type || null) as TripType | null,
    },
  };
}
