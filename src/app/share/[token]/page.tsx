import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemImage } from "@/app/closet/item-image";
import { signedPhotoUrls } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import { capitalize, formatTripDates } from "@/lib/trips";
import type { Climate, TripType } from "@/lib/types";

// Keep shared lists out of search engines; they're for people with the link.
export const metadata: Metadata = {
  title: "Packing list · Closet Catalog",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type SharedTrip = {
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  climate: Climate | null;
  trip_type: TripType | null;
  items: {
    id: string;
    name: string;
    category: string;
    color: string | null;
    brand: string | null;
    photo_path: string | null;
    photo_url: string | null;
  }[];
};

// The public, read-only view of one trip. Works without logging in.
export default async function SharedTripPage({ params }: PageProps<"/share/[token]">) {
  const { token } = await params;
  const supabase = await createClient();

  // get_shared_trip only answers if sharing is on and the token matches
  // (see supabase/migrations/0004_share_links.sql).
  const { data } = await supabase.rpc("get_shared_trip", { token });
  const trip = data as SharedTrip | null;
  if (!trip) notFound();

  const photoUrls = await signedPhotoUrls(supabase, trip.items.map((item) => item.photo_path));
  const details = [trip.trip_type, trip.climate].filter(Boolean).map((v) => capitalize(v!));
  const dates = formatTripDates(trip.start_date, trip.end_date);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em]">Closet Catalog</p>

      <div className="mt-10">
        <p className="label">Here&apos;s what I&apos;m packing{details.length ? ` · ${details.join(" · ")}` : ""}</p>
        <h1 className="mt-1 text-4xl font-medium tracking-tight">{trip.name}</h1>
        {(trip.destination || dates) && (
          <p className="mt-2 text-muted">{[trip.destination, dates].filter(Boolean).join(" · ")}</p>
        )}
        <p className="label mt-4">
          {trip.items.length} {trip.items.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {trip.items.length === 0 ? (
        <p className="py-20 text-center text-muted">Nothing on this list yet.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {trip.items.map((item) => (
            <li key={item.id}>
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-tile">
                <ItemImage
                  uploadedSrc={item.photo_path && photoUrls.get(item.photo_path)}
                  linkSrc={item.photo_url}
                  color={item.color}
                  alt={item.name}
                />
              </div>
              <p className="mt-3 text-sm font-medium">{item.name}</p>
              <p className="label mt-0.5">{[item.category, item.brand].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-16 border-t border-line pt-6 text-center text-sm text-muted">
        Shared from Closet Catalog.{" "}
        <Link href="/signup" className="text-accent underline-offset-4 hover:underline">
          Make your own packing lists
        </Link>
      </p>
    </main>
  );
}
