import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Trip } from "@/lib/types";
import { updateTrip } from "../../actions";
import { TripForm } from "../../trip-form";

export default async function EditTripPage({ params }: PageProps<"/closet/trips/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", id).maybeSingle<Trip>();
  if (!trip) notFound();

  return (
    <section>
      <p className="label">Edit trip</p>
      <h1 className="mt-1 mb-8 text-3xl font-medium tracking-tight">{trip.name}</h1>
      <TripForm action={updateTrip.bind(null, trip.id)} trip={trip} cancelHref={`/closet/trips/${trip.id}`} />
    </section>
  );
}
