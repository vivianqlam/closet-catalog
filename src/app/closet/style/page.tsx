import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/photos";
import {
  ACCESSORY_CATEGORY,
  BOTTOM_CATEGORY,
  OUTERWEAR_CATEGORY,
  SHOES_CATEGORY,
  TOP_CATEGORY,
  type StyleItem,
} from "@/lib/style";
import type { Item } from "@/lib/types";
import { StyleMe } from "./style-me";

type Row = Pick<Item, "id" | "name" | "brand" | "color" | "category_id" | "photo_path" | "photo_url">;

// "Style me": flip through your own tops, bottoms and shoes to build an outfit.
// Read-only: it only looks at items, it never saves anything.
export default async function StylePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("id, name, brand, color, category_id, photo_path, photo_url")
    .in("category_id", [TOP_CATEGORY, BOTTOM_CATEGORY, OUTERWEAR_CATEGORY, SHOES_CATEGORY, ACCESSORY_CATEGORY])
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  // Pieces with a photo come first, so the first outfit you see has pictures.
  const rows = [...(data ?? [])].sort(
    (a, b) => Number(!(a.photo_path || a.photo_url)) - Number(!(b.photo_path || b.photo_url)),
  );
  const photoUrls = await signedPhotoUrls(supabase, rows.map((row) => row.photo_path));
  const items: StyleItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    color: row.color,
    category_id: row.category_id,
    photoSrc: (row.photo_path && photoUrls.get(row.photo_path)) || null,
    photo_url: row.photo_url,
  }));

  return (
    <section className="mx-auto max-w-md">
      <h1 className="font-display text-3xl leading-tight sm:text-4xl">
        <span className="highlight">Style</span> me
      </h1>
      <p className="mt-2 text-sm text-muted">
        Flip through your pieces, or let the closet pick for you.
      </p>
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Add a few tops, bottoms and shoes to start styling.</p>
          <Link
            href="/closet/items/new"
            className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Add an item
          </Link>
        </div>
      ) : (
        <StyleMe items={items} />
      )}
    </section>
  );
}
