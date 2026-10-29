"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FORMALITIES, SEASONS, type Category, type Item } from "@/lib/types";
import type { ItemFormState } from "./actions";

const inputClass =
  "mt-1 w-full border border-line bg-transparent px-3 py-2 focus:border-ink focus:outline-none";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block">
        {label}
      </label>
      {children}
    </div>
  );
}

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
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid max-w-xl gap-5">
      <Field label="Name" htmlFor="name">
        <input id="name" name="name" required defaultValue={item?.name} className={inputClass} placeholder="Navy wool coat" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" htmlFor="category_id">
          <select id="category_id" name="category_id" required defaultValue={item?.category_id ?? ""} className={inputClass}>
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
        <Field label="Color" htmlFor="color">
          <input id="color" name="color" defaultValue={item?.color ?? ""} className={inputClass} placeholder="Navy" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Season" htmlFor="season">
          <select id="season" name="season" required defaultValue={item?.season ?? ""} className={inputClass}>
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
        <Field label="Formality" htmlFor="formality">
          <select id="formality" name="formality" defaultValue={item?.formality ?? ""} className={inputClass}>
            <option value="">Not set</option>
            {FORMALITIES.map((f) => (
              <option key={f} value={f}>
                {capitalize(f)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Brand" htmlFor="brand">
        <input id="brand" name="brand" defaultValue={item?.brand ?? ""} className={inputClass} placeholder="Everlane" />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <textarea id="notes" name="notes" rows={3} defaultValue={item?.notes ?? ""} className={inputClass} placeholder="Runs small; dry clean only" />
      </Field>

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
          {pending ? "Saving…" : "Save item"}
        </button>
        <Link href={cancelHref} className="rounded-full border border-line px-6 py-2.5 text-sm hover:border-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
