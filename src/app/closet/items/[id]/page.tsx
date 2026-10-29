import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Item } from "@/lib/types";
import { Swatch } from "../../swatch";
import { woreIt } from "../actions";
import { StarButton } from "../../star-button";
import { DeleteButton } from "./delete-button";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default async function ItemPage({ params }: PageProps<"/closet/items/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: item }, { data: star }] = await Promise.all([
    supabase
      .from("items")
      .select("*, categories(name)")
      .eq("id", id)
      .maybeSingle<Item & { categories: Pick<Category, "name"> }>(),
    supabase.from("stars").select("item_id").eq("item_id", id).maybeSingle(),
  ]);
  if (!item) notFound();

  const details = [
    ["Category", item.categories.name],
    ["Color", item.color],
    ["Season", capitalize(item.season)],
    ["Formality", item.formality && capitalize(item.formality)],
    ["Brand", item.brand],
    ["Last worn", item.last_worn_on && new Date(`${item.last_worn_on}T00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
  ] as const;

  return (
    <section>
      <Link href="/closet" className="label hover:!text-ink">
        ← Back to closet
      </Link>

      <div className="mt-4 grid border border-line md:grid-cols-[1fr_380px]">
        <div className="flex aspect-square items-center justify-center bg-tile md:aspect-auto md:min-h-[480px]">
          <Swatch color={item.color} size="lg" />
        </div>

        <aside className="flex flex-col border-t border-line p-6 md:border-t-0 md:border-l">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="label">{item.categories.name}</p>
              <h1 className="mt-1 text-2xl font-medium tracking-tight">{item.name}</h1>
            </div>
            <StarButton itemId={item.id} itemName={item.name} starred={Boolean(star)} />
          </div>

          <dl className="mt-6 divide-y divide-line border-y border-line">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="label self-center">{label}</dt>
                <dd className="text-right text-sm">{value || "—"}</dd>
              </div>
            ))}
          </dl>

          {item.notes && <p className="mt-4 text-sm whitespace-pre-line text-muted">{item.notes}</p>}

          <div className="mt-6 flex items-center justify-between gap-4 bg-tile px-4 py-3">
            <div>
              <p className="label">Times worn</p>
              <p className="text-2xl font-medium">{item.times_worn}</p>
            </div>
            <form action={woreIt.bind(null, item.id)}>
              <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent">
                Wore it
              </button>
            </form>
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <Link
              href={`/closet/items/${item.id}/edit`}
              className="rounded-full border border-line px-5 py-2 text-sm hover:border-ink"
            >
              Edit
            </Link>
            <DeleteButton id={item.id} name={item.name} />
          </div>
        </aside>
      </div>
    </section>
  );
}
