// Shapes of the database rows (see supabase/migrations/0002_data_model.sql).

export const SEASONS = ["spring", "summer", "fall", "winter", "all-season"] as const;
export const FORMALITIES = ["casual", "smart casual", "business", "formal"] as const;
export const CLIMATES = ["hot", "warm", "mild", "cold", "snow"] as const;

export type Season = (typeof SEASONS)[number];
export type Formality = (typeof FORMALITIES)[number];
export type Climate = (typeof CLIMATES)[number];

export type Category = {
  id: number;
  name: string;
  sort_order: number;
};

export type Item = {
  id: string;
  user_id: string;
  category_id: number;
  name: string;
  color: string | null;
  season: Season;
  formality: Formality | null;
  brand: string | null;
  notes: string | null;
  photo_path: string | null;
  photo_url: string | null;
  times_worn: number;
  last_worn_on: string | null;
  created_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  climate: Climate | null;
  trip_type: string | null;
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
};

export type TripItem = {
  trip_id: string;
  item_id: string;
  packed: boolean;
};

export type Star = {
  user_id: string;
  item_id: string;
  created_at: string;
};
