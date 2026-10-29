"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { FORMALITIES, SEASONS, type Category, type Item } from "@/lib/types";
import type { ItemField } from "@/lib/validation";
import { Field, inputProps } from "../form-field";
import type { ItemFormState } from "./actions";
import { PhotoPicker, type PickedPhoto } from "./photo-picker";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function ItemForm({
  action,
  categories,
  item,
  cancelHref,
}: {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  categories: Category[];
  item?: Item;
  cancelHref: string;
}) {
  // New items can include a photo, picked and cropped here and sent along
  // with the form. (Existing items change their photo on the item page.)
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  // The save step reads the photo from here: the function given to
  // useActionState is kept from the first render, so it would otherwise
  // still see "no photo".
  const photoRef = useRef<PickedPhoto | null>(null);
  const choosePhoto = (next: PickedPhoto | null) => {
    photoRef.current = next;
    setPhoto(next);
  };

  // Count save attempts so the form can be redrawn after each one (see key below).
  const [state, formAction, pending] = useActionState(
    async (prev: ItemFormState & { attempt: number }, formData: FormData) => {
      if (photoRef.current && !item) formData.set("photo", photoRef.current.file);
      return { ...(await action(prev, formData)), attempt: prev.attempt + 1 };
    },
    { attempt: 0 },
  );

  // After a failed save, show what was typed; otherwise the saved item (or blank).
  const initial = (field: ItemField) =>
    state.values?.[field] ?? (item?.[field] == null ? "" : String(item[field]));

  const fieldProps = (field: ItemField) => inputProps(field, initial(field), state.errors?.[field]);

  return (
    // noValidate: skip the browser's own pop-ups so our friendlier messages show instead.
    // key: React clears a form after each save attempt, and dropdowns would lose their
    // choice, so a failed save redraws the form filled with what was typed.
    <form key={state.attempt} action={formAction} noValidate className="grid max-w-xl gap-5">
      {!item && <PhotoPicker value={photo} onChange={choosePhoto} />}

      <Field field="name" label="Name *" error={state.errors?.name}>
        <input {...fieldProps("name")} required placeholder="Navy wool coat" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field field="category_id" label="Category *" error={state.errors?.category_id}>
          <select {...fieldProps("category_id")} required>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field field="color" label="Color" error={state.errors?.color}>
          <input {...fieldProps("color")} placeholder="Navy" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field field="season" label="Season *" error={state.errors?.season}>
          <select {...fieldProps("season")} required>
            <option value="" disabled>
              Choose…
            </option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {capitalize(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field field="formality" label="Formality" error={state.errors?.formality}>
          <select {...fieldProps("formality")}>
            <option value="">Not set</option>
            {FORMALITIES.map((f) => (
              <option key={f} value={f}>
                {capitalize(f)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field field="brand" label="Brand" error={state.errors?.brand}>
        <input {...fieldProps("brand")} placeholder="Everlane" />
      </Field>

      <Field field="notes" label="Notes" error={state.errors?.notes}>
        <textarea {...fieldProps("notes")} rows={3} placeholder="Runs small; dry clean only" />
      </Field>

      <p className="text-xs text-muted">* Required</p>

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
          {pending ? (photo && !item ? "Saving item and photo…" : "Saving…") : "Save item"}
        </button>
        <Link href={cancelHref} className="rounded-full border border-line px-6 py-2.5 text-sm hover:border-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
