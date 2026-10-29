import { createTrip } from "../actions";
import { TripForm } from "../trip-form";

export default function NewTripPage() {
  return (
    <section>
      <p className="label">New trip</p>
      <h1 className="mt-1 mb-8 text-3xl font-medium tracking-tight">Plan a trip</h1>
      <TripForm action={createTrip} cancelHref="/closet/trips" />
    </section>
  );
}
