// Test 2 from PLAN.md §4: the dashboard stats.
//
// In plain English: if my closet has 3 tops, 1 bottom and 2 pairs of shoes,
// and I've worn one pair of shoes 5 times (more than anything else), the
// dashboard must say I own 6 things, show Tops 3 / Bottoms 1 / Shoes 2 in the
// chart, and name that pair of shoes as my most-worn item.
import { describe, expect, it } from "vitest";
import { computeDashboard, type DashboardItem } from "@/lib/dashboard";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "Tops", sort_order: 1 },
  { id: 2, name: "Bottoms", sort_order: 2 },
  { id: 3, name: "Dresses", sort_order: 3 },
  { id: 4, name: "Outerwear", sort_order: 4 },
  { id: 5, name: "Shoes", sort_order: 5 },
  { id: 6, name: "Accessories", sort_order: 6 },
];

const item = (
  id: string,
  name: string,
  category_id: number,
  times_worn: number,
  season: DashboardItem["season"] = "fall",
): DashboardItem => ({ id, name, category_id, times_worn, season });

const closet: DashboardItem[] = [
  item("t1", "White tee", 1, 2, "summer"),
  item("t2", "Striped shirt", 1, 3, "all-season"),
  item("t3", "Cashmere sweater", 1, 1, "winter"),
  item("b1", "Dark jeans", 2, 4, "all-season"),
  item("s1", "Black loafers", 5, 5, "all-season"),
  item("s2", "White sneakers", 5, 0),
];

describe("dashboard stats", () => {
  const stats = computeDashboard(closet, categories);

  it("counts 6 items in total", () => {
    expect(stats.total).toBe(6);
  });

  it("counts Tops 3 / Bottoms 1 / Shoes 2 for the chart", () => {
    const count = (name: string) => stats.perCategory.find((row) => row.name === name)?.count;
    expect(count("Tops")).toBe(3);
    expect(count("Bottoms")).toBe(1);
    expect(count("Shoes")).toBe(2);
    expect(count("Dresses")).toBe(0);
  });

  it("names the shoes worn 5 times as the most-worn item", () => {
    expect(stats.mostWorn).toEqual({ id: "s1", name: "Black loafers", timesWorn: 5 });
  });

  it("says half the closet is all-season (3 of 6)", () => {
    expect(stats.allSeasonPercent).toBe(50);
  });

  it("handles an empty closet without inventing numbers", () => {
    const empty = computeDashboard([], categories);
    expect(empty.total).toBe(0);
    expect(empty.mostWorn).toBeNull();
    expect(empty.allSeasonPercent).toBeNull();
  });
});
