import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeDashboard, type DashboardItem } from "@/lib/dashboard";
import type { Category } from "@/lib/types";
import { CategoryChart } from "./category-chart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("items")
      .select("id, name, category_id, season, times_worn")
      .returns<DashboardItem[]>(),
    supabase.from("categories").select("*").returns<Category[]>(),
  ]);

  const { total, perCategory, mostWorn, allSeasonPercent } = computeDashboard(
    items ?? [],
    categories ?? [],
  );

  return (
    <section>
      <p className="label">Dashboard</p>
      <h1 className="mt-1 text-3xl font-medium tracking-tight">Your wardrobe at a glance</h1>

      <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
        <div className="bg-paper p-5">
          <dt className="label">Total items</dt>
          <dd className="mt-2 text-5xl font-medium tracking-tight" data-testid="total-items">
            {total}
          </dd>
        </div>
        <div className="bg-paper p-5">
          <dt className="label">Most worn</dt>
          <dd className="mt-2" data-testid="most-worn">
            {mostWorn ? (
              <>
                <Link href={`/closet/items/${mostWorn.id}`} className="text-xl font-medium hover:text-accent">
                  {mostWorn.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  Worn {mostWorn.timesWorn} {mostWorn.timesWorn === 1 ? "time" : "times"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Nothing worn yet. Tap “Wore it” on an item.</p>
            )}
          </dd>
        </div>
        <div className="bg-paper p-5">
          <dt className="label">All-season</dt>
          <dd className="mt-2" data-testid="all-season">
            <span className="text-3xl font-medium">
              {allSeasonPercent === null ? "—" : `${allSeasonPercent}%`}
            </span>
            <p className="mt-1 text-sm text-muted">of your closet works year-round</p>
          </dd>
        </div>
      </dl>

      <div className="mt-10 border border-line p-5">
        <h2 className="label">Items per category</h2>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            Add a few pieces and your chart shows up here.
          </p>
        ) : (
          <>
            <div
              className="mt-4"
              role="img"
              aria-label={`Bar chart of items per category: ${perCategory
                .map((row) => `${row.name} ${row.count}`)
                .join(", ")}.`}
            >
              <CategoryChart data={perCategory} />
            </div>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-muted hover:text-ink">Show as a table</summary>
              <table className="mt-2 w-full max-w-xs">
                <thead>
                  <tr className="label text-left">
                    <th className="py-1 font-medium">Category</th>
                    <th className="py-1 text-right font-medium">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {perCategory.map((row) => (
                    <tr key={row.name} className="border-t border-line">
                      <td className="py-1">{row.name}</td>
                      <td className="py-1 text-right tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </div>
    </section>
  );
}
