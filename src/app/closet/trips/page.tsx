import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { capitalize, formatTripDates } from "@/lib/trips";
import type { Trip } from "@/lib/types";

type TripRow = Trip & { trip_items: { packed: boolean }[] };

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from("trips")
    .select("*, trip_items(packed)")
    .order("start_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<TripRow[]>();

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight">Your trips</h1>
        <Link
          href="/closet/trips/new"
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium whitespace-nowrap text-paper hover:bg-accent"
        >
          + New trip
        </Link>
      </div>

      {!trips?.length ? (
        <div className="py-20 text-center">
          <p className="text-muted">Plan a trip and build its packing list from your closet.</p>
          <Link
            href="/closet/trips/new"
            className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
          >
            Plan your first trip
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            const total = trip.trip_items.length;
            const packed = trip.trip_items.filter((row) => row.packed).length;
            const details = [trip.trip_type, trip.climate].filter(Boolean).map((v) => capitalize(v!));
            return (
              <li key={trip.id}>
                <Link
                  href={`/closet/trips/${trip.id}`}
                  className="block border border-line p-5 transition hover:-translate-y-0.5 hover:border-ink"
                >
                  <p className="label">{details.join(" · ") || "Trip"}</p>
                  <p className="mt-1 text-lg font-medium">{trip.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {[trip.destination, formatTripDates(trip.start_date, trip.end_date)]
                      .filter(Boolean)
                      .join(" · ") || "No dates yet"}
                  </p>
                  <div className="mt-4 h-1 bg-tile" aria-hidden>
                    <div className="h-full bg-ink" style={{ width: total ? `${(packed / total) * 100}%` : 0 }} />
                  </div>
                  <p className="label mt-2">
                    {total === 0 ? "Nothing on the list yet" : `${packed} of ${total} packed`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
