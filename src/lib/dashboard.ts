// Works out the dashboard numbers from a list of items.
// Kept free of Next.js and Supabase so it can be unit tested on its own.
import type { Category, Item } from "./types";

export type DashboardItem = Pick<Item, "id" | "name" | "category_id" | "season" | "times_worn">;

export type Dashboard = {
  total: number;
  perCategory: { name: string; count: number }[];
  // null when nothing has been worn yet.
  mostWorn: { id: string; name: string; timesWorn: number } | null;
  // Whole-number percent; null when the closet is empty.
  allSeasonPercent: number | null;
};

export function computeDashboard(items: DashboardItem[], categories: Category[]): Dashboard {
  const total = items.length;

  const perCategory = [...categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      name: category.name,
      count: items.filter((item) => item.category_id === category.id).length,
    }));

  // Highest times worn wins; ties go to the name that comes first A–Z.
  const top = [...items].sort(
    (a, b) => b.times_worn - a.times_worn || a.name.localeCompare(b.name),
  )[0];
  const mostWorn =
    top && top.times_worn > 0 ? { id: top.id, name: top.name, timesWorn: top.times_worn } : null;

  const allSeason = items.filter((item) => item.season === "all-season").length;
  const allSeasonPercent = total === 0 ? null : Math.round((allSeason / total) * 100);

  return { total, perCategory, mostWorn, allSeasonPercent };
}
