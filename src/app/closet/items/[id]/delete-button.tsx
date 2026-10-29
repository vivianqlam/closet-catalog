"use client";

import { useRef } from "react";
import { deleteItem } from "../actions";

// Delete with an "Are you sure?" step, using the browser's built-in dialog element.
export function DeleteButton({ id, name }: { id: string; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full border border-line px-5 py-2 text-sm text-accent hover:border-accent"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        className="m-auto max-w-sm border border-line bg-paper p-6 text-ink backdrop:bg-ink/40"
      >
        <h2 id="delete-title" className="text-lg font-medium">
          Delete &ldquo;{name}&rdquo;?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Are you sure? This removes it from your closet and from any trips. It can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full border border-line px-5 py-2 text-sm hover:border-ink"
          >
            Keep it
          </button>
          <form action={deleteItem.bind(null, id)}>
            <button type="submit" className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-ink">
              Yes, delete
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
