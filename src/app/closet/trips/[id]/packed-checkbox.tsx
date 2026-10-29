"use client";

import { useOptimistic, useTransition } from "react";
import { setPacked } from "../actions";

// Checks off a piece as packed; it ticks right away and saves in the background.
export function PackedCheckbox({
  tripId,
  itemId,
  itemName,
  packed,
}: {
  tripId: string;
  itemId: string;
  itemName: string;
  packed: boolean;
}) {
  const [optimisticPacked, setOptimisticPacked] = useOptimistic(packed);
  const [, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={optimisticPacked}
      aria-label={`Packed ${itemName}`}
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          setOptimisticPacked(next);
          await setPacked(tripId, itemId, next);
        });
      }}
      className="size-5 cursor-pointer accent-ink"
    />
  );
}
