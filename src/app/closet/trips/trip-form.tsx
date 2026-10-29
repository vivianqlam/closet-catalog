"use client";

import Link from "next/link";
import { useActionState } from "react";
import { capitalize } from "@/lib/trips";
import { CLIMATES, TRIP_TYPES, type Trip } from "@/lib/types";
import type { TripField } from "@/lib/validation";
import { Field, inputProps } from "../form-field";
import type { TripFormState } from "./actions";

export function TripForm({
  action,
  trip,
  cancelHref,
}: {
  action: (prev: TripFormState, formData: FormData) => Promise<TripFormState>;
  trip?: Trip;
  cancelHref: string;
}) {
  // Count save attempts so the form can be redrawn after each one (see key below).
  const [state, formAction, pending] = useActionState(
    async (prev: TripFormState & { attempt: number }, formData: FormData) => ({
      ...(await action(prev, formData)),
      attempt: prev.attempt + 1,
    }),
    { attempt: 0 },
  );

  // After a failed save, show what was typed; otherwise the saved trip (or blank).
  const initial = (field: TripField) =>
    state.values?.[field] ?? (trip?.[field] == null ? "" : String(trip[field]));
  const fieldProps = (field: TripField) => inputProps(field, initial(field), state.errors?.[field]);

  return (
    // noValidate: skip the browser's own pop-ups so our friendlier messages show instead.
    // key: a failed save redraws the form filled with what was typed (dropdowns included).
    <form key={state.attempt} action={formAction} noValidate className="grid max-w-xl gap-5">
      <Field field="name" label="Trip name *" error={state.errors?.name}>
        <input {...fieldProps("name")} required placeholder="Spring trek to Patagonia" />
      </Field>

      <Field field="destination" label="Destination" error={state.errors?.destination}>
        <input {...fieldProps("destination")} placeholder="Torres del Paine, Chile" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field field="start_date" label="Start date" error={state.errors?.start_date}>
          <input {...fieldProps("start_date")} type="date" />
        </Field>
        <Field field="end_date" label="End date" error={state.errors?.end_date}>
          <input {...fieldProps("end_date")} type="date" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field field="climate" label="Climate" error={state.errors?.climate}>
          <select {...fieldProps("climate")}>
            <option value="">Not set</option>
            {CLIMATES.map((c) => (
              <option key={c} value={c}>
                {capitalize(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field field="trip_type" label="Trip type" error={state.errors?.trip_type}>
          <select {...fieldProps("trip_type")}>
            <option value="">Not set</option>
            {TRIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalize(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="text-xs text-muted">* Required. Picking a climate lets the app suggest pieces from your closet.</p>

      {state.error && (
        <p role="alert" className="border-l-2 border-accent bg-accent/5 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save trip"}
        </button>
        <Link href={cancelHref} className="rounded-full border border-line px-6 py-2.5 text-sm hover:border-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
