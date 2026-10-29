"use client";

import { useOptimistic, useTransition } from "react";
import { toggleStar } from "./items/actions";

// Star toggle that flips right away, then saves in the background.
export function StarButton({
  itemId,
  itemName,
  starred,
  className = "",
}: {
  itemId: string;
  itemName: string;
  starred: boolean;
  className?: string;
}) {
  const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={optimisticStarred}
      aria-label={optimisticStarred ? `Unstar ${itemName}` : `Star ${itemName}`}
      title={optimisticStarred ? "Starred" : "Star"}
      onClick={() =>
        startTransition(async () => {
          setOptimisticStarred(!optimisticStarred);
          await toggleStar(itemId, optimisticStarred);
        })
      }
      className={`flex size-9 items-center justify-center rounded-full text-xl leading-none transition hover:bg-paper ${
        optimisticStarred ? "text-accent" : "text-muted hover:text-ink"
      } ${className}`}
    >
      {optimisticStarred ? "★" : "☆"}
    </button>
  );
}
