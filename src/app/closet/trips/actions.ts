"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readTripValues, validateTrip, type TripErrors, type TripValues } from "@/lib/validation";

export type TripFormState = {
  error?: string;
  errors?: TripErrors;
  // What was typed, so the form can show it again after a failed save.
  values?: TripValues;
};

const FIX_FIELDS = "Please fix the highlighted fields.";

export async function createTrip(_prev: TripFormState, formData: FormData): Promise<TripFormState> {
  const values = readTripValues(formData);
  const result = validateTrip(values);
  if (!result.ok) return { error: FIX_FIELDS, errors: result.errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").insert(result.row).select("id").single();
  if (error) return { error: "Couldn't save this trip. Please try again.", values };

  revalidatePath("/closet/trips");
  redirect(`/closet/trips/${data.id}`);
}

export async function updateTrip(
  id: string,
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const values = readTripValues(formData);
  const result = validateTrip(values);
  if (!result.ok) return { error: FIX_FIELDS, errors: result.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.from("trips").update(result.row).eq("id", id);
  if (error) return { error: "Couldn't save your changes. Please try again.", values };

  revalidatePath("/closet/trips");
  redirect(`/closet/trips/${id}`);
}

// Deleting a trip also removes its packing list (the items stay in your closet).
export async function deleteTrip(id: string) {
  const supabase = await createClient();
  await supabase.from("trips").delete().eq("id", id);
  revalidatePath("/closet/trips");
  redirect("/closet/trips");
}

function refresh(tripId: string) {
  revalidatePath("/closet/trips");
  revalidatePath(`/closet/trips/${tripId}`);
}

// The database rules only allow adding your own items to your own trips.
export async function addToTrip(tripId: string, itemId: string) {
  const supabase = await createClient();
  await supabase.from("trip_items").insert({ trip_id: tripId, item_id: itemId });
  refresh(tripId);
}

export async function removeFromTrip(tripId: string, itemId: string) {
  const supabase = await createClient();
  await supabase.from("trip_items").delete().eq("trip_id", tripId).eq("item_id", itemId);
  refresh(tripId);
}

export async function setPacked(tripId: string, itemId: string, packed: boolean) {
  const supabase = await createClient();
  await supabase
    .from("trip_items")
    .update({ packed })
    .eq("trip_id", tripId)
    .eq("item_id", itemId);
  refresh(tripId);
}

// Turns on the read-only link. Each time sharing is turned on, a brand-new
// secret token is made, so an old link never comes back to life.
export async function startSharing(tripId: string) {
  const supabase = await createClient();
  await supabase
    .from("trips")
    .update({ is_shared: true, share_token: randomBytes(18).toString("base64url") })
    .eq("id", tripId);
  refresh(tripId);
}

// Turns the link off right away: the token is erased, so the old link shows nothing.
export async function stopSharing(tripId: string) {
  const supabase = await createClient();
  await supabase.from("trips").update({ is_shared: false, share_token: null }).eq("id", tripId);
  refresh(tripId);
}
