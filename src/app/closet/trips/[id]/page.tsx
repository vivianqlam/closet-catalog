import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signedPhotoUrls } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import { capitalize, formatTripDates, seasonsFor } from "@/lib/trips";
import type { Category, Item, Trip } from "@/lib/types";
import { ConfirmDelete } from "../../confirm-delete";
import { ItemImage } from "../../item-image";
import { addToTrip, deleteTrip, removeFromTrip } from "../actions";
import { PackedCheckbox } from "./packed-checkbox";
import { SharePanel } from "./share-panel";

type ClosetItem = Pick<Item, "id" | "name" | "color" | "season" | "category_id" | "photo_path" | "photo_url">;

export default async function TripPage({ params, searchParams }: PageProps<"/closet/trips/[id]">) {
  const { id } = await params;
  const showAll = (await searchParams).all === "1";
  const supabase = await createClient();

  const [{ data: trip }, { data: packing }, { data: items }, { data: categories }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", id).maybeSingle<Trip>(),
    supabase.from("trip_items").select("item_id, packed").eq("trip_id", id).returns<{ item_id: string; packed: boolean }[]>(),
    supabase
      .from("items")
      .select("id, name, color, season, category_id, photo_path, photo_url")
      .order("name")
      .returns<ClosetItem[]>(),
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
  ]);
  if (!trip) notFound();

  const closet = items ?? [];
  const packedById = new Map((packing ?? []).map((row) => [row.item_id, row.packed]));
  const categoryOrder = (c: number) => categories?.find((cat) => cat.id === c)?.sort_order ?? 99;
  const categoryName = (c: number) => categories?.find((cat) => cat.id === c)?.name ?? "";

  const onTrip = closet
    .filter((item) => packedById.has(item.id))
    .sort((a, b) => categoryOrder(a.category_id) - categoryOrder(b.category_id) || a.name.localeCompare(b.name));
  const packedCount = onTrip.filter((item) => packedById.get(item.id)).length;

  // Pieces you could add: everything not on the list yet, narrowed to the
  // trip's climate unless you ask to see everything.
  const suggestedSeasons = trip.climate ? seasonsFor(trip.climate) : null;
  const notOnTrip = closet.filter((item) => !packedById.has(item.id));
  const filtering = suggestedSeasons && !showAll;
  const candidates = filtering ? notOnTrip.filter((item) => suggestedSeasons.includes(item.season)) : notOnTrip;

  const photoUrls = await signedPhotoUrls(supabase, [...onTrip, ...candidates].map((item) => item.photo_path));
  const image = (item: ClosetItem, size: "sm" | "md") => (
    <ItemImage
      uploadedSrc={item.photo_path && photoUrls.get(item.photo_path)}
      linkSrc={item.photo_url}
      color={item.color}
      alt=""
      size={size}
    />
  );

  // The full share address, built from the address this page was opened on.
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const shareUrl = trip.is_shared && trip.share_token ? `${protocol}://${host}/share/${trip.share_token}` : null;

  const details = [trip.trip_type, trip.climate].filter(Boolean).map((v) => capitalize(v!));
  const dates = formatTripDates(trip.start_date, trip.end_date);

  return (
    <section>
      <Link href="/closet/trips" className="label hover:!text-ink">
        ← Back to trips
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">{details.join(" · ") || "Trip"}</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight">{trip.name}</h1>
          {(trip.destination || dates) && (
            <p className="mt-1 text-muted">{[trip.destination, dates].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/closet/trips/${trip.id}/edit`}
            className="rounded-full border border-line px-5 py-2 text-sm hover:border-ink"
          >
            Edit
          </Link>
          <ConfirmDelete
            name={trip.name}
            description="This deletes the trip and its packing list. The pieces stay in your closet."
            action={deleteTrip.bind(null, trip.id)}
          />
        </div>
      </div>

      <SharePanel tripId={trip.id} shareUrl={shareUrl} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex items-end justify-between border-b border-line pb-2">
            <h2 className="label !text-ink">Packing list</h2>
            <p className="label" aria-live="polite">
              {onTrip.length === 0 ? "Empty" : `${packedCount} of ${onTrip.length} packed`}
            </p>
          </div>
          {onTrip.length > 0 && (
            <div className="mt-2 h-1 bg-tile" aria-hidden>
              <div className="h-full bg-ink transition-all" style={{ width: `${(packedCount / onTrip.length) * 100}%` }} />
            </div>
          )}

          {onTrip.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Add pieces from your closet to start the list.</p>
          ) : (
            <ul className="divide-y divide-line">
              {onTrip.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <PackedCheckbox
                    tripId={trip.id}
                    itemId={item.id}
                    itemName={item.name}
                    packed={Boolean(packedById.get(item.id))}
                  />
                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden bg-tile">
                    {image(item, "sm")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/closet/items/${item.id}`}
                      className={`block truncate text-sm font-medium hover:text-accent ${
                        packedById.get(item.id) ? "text-muted line-through" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                    <p className="label">{categoryName(item.category_id)}</p>
                  </div>
                  <form action={removeFromTrip.bind(null, trip.id, item.id)}>
                    <button
                      type="submit"
                      aria-label={`Remove ${item.name} from this trip`}
                      className="rounded-full px-2 text-lg leading-none text-muted hover:text-accent"
                    >
                      ×
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2">
            <h2 className="label !text-ink">
              {filtering ? `Suggested for ${trip.climate} weather` : "Add from your closet"}
            </h2>
            {suggestedSeasons && (
              <Link
                href={showAll ? `/closet/trips/${trip.id}` : `/closet/trips/${trip.id}?all=1`}
                className="label underline-offset-4 hover:!text-ink hover:underline"
              >
                {showAll ? `Only ${trip.climate}-weather pieces` : "Show everything"}
              </Link>
            )}
          </div>

          {candidates.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              {closet.length === 0
                ? "Your closet is empty. Add some pieces first."
                : notOnTrip.length === 0
                  ? "Everything in your closet is on this trip."
                  : "Nothing in your closet matches this climate."}
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {candidates.map((item) => (
                <li key={item.id}>
                  <form action={addToTrip.bind(null, trip.id, item.id)}>
                    <button type="submit" className="group block w-full text-left" aria-label={`Add ${item.name} to this trip`}>
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-tile">
                        {image(item, "md")}
                        <span className="absolute right-2 bottom-2 rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium group-hover:bg-ink group-hover:text-paper">
                          + Add
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm">{item.name}</p>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
