"use client";

import Link from "next/link";
import { useState } from "react";
import { outfitRows, randomIndex, stepIndex, type StyleItem } from "@/lib/style";
import { ItemImage } from "../item-image";

type RowKey = "top" | "bottom" | "shoes";
const ROWS: { key: RowKey; label: string; empty: string }[] = [
  { key: "top", label: "Top", empty: "No tops yet." },
  { key: "bottom", label: "Bottom", empty: "No bottoms yet." },
  { key: "shoes", label: "Shoes", empty: "No shoes yet." },
];

// The interactive part of "Style me": three rows you flip through with arrows.
export function StyleMe({ items }: { items: StyleItem[] }) {
  const [includeOuterwear, setIncludeOuterwear] = useState(false);
  const [picks, setPicks] = useState<Record<RowKey, number>>({ top: 0, bottom: 0, shoes: 0 });
  const [matched, setMatched] = useState(false);

  const rows = outfitRows(items, includeOuterwear);
  const current = (key: RowKey) => rows[key][picks[key]];
  const complete = ROWS.every(({ key }) => current(key));

  function step(key: RowKey, by: number) {
    setPicks((p) => ({ ...p, [key]: stepIndex(p[key], by, rows[key].length) }));
    setMatched(false);
  }

  function surprise() {
    setPicks((p) => ({
      top: randomIndex(rows.top.length, p.top),
      bottom: randomIndex(rows.bottom.length, p.bottom),
      shoes: randomIndex(rows.shoes.length, p.shoes),
    }));
    setMatched(false);
  }

  function toggleOuterwear(on: boolean) {
    setIncludeOuterwear(on);
    // The Top row changes length, so start it from the beginning again.
    setPicks((p) => ({ ...p, top: 0 }));
    setMatched(false);
  }

  return (
    <div className="mt-6">
      <div className="border-3 border-ballet bg-white/60 px-3 py-4 sm:px-5">
        {ROWS.map(({ key, label, empty }, i) => {
          const list = rows[key];
          const item = current(key);
          return (
            <div key={key} className={i > 0 ? "mt-4 border-t border-line pt-4" : ""}>
              <div className="flex items-center justify-between">
                <p className="label">{label}</p>
                {key === "top" && (
                  <label className="label flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={includeOuterwear}
                      onChange={(e) => toggleOuterwear(e.target.checked)}
                      className="accent-accent"
                    />
                    Include outerwear
                  </label>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <ArrowButton
                  direction="previous"
                  label={label}
                  disabled={list.length < 2}
                  onClick={() => step(key, -1)}
                />
                <div className="min-w-0 flex-1" aria-live="polite">
                  {item ? (
                    <>
                      <div className="relative mx-auto flex aspect-square w-full max-w-32 items-center sm:max-w-40 justify-center overflow-hidden bg-tile">
                        <ItemImage uploadedSrc={item.photoSrc} linkSrc={item.photo_url} color={item.color} alt="" />
                      </div>
                      <div className="mt-2 text-center">
                        <Link
                          href={`/closet/items/${item.id}`}
                          className="block truncate text-sm font-medium hover:text-accent"
                        >
                          {item.name}
                        </Link>
                        <p className="label mt-0.5 truncate">
                          {[item.brand, `${picks[key] + 1} of ${list.length}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted">{empty}</p>
                  )}
                </div>
                <ArrowButton
                  direction="next"
                  label={label}
                  disabled={list.length < 2}
                  onClick={() => step(key, 1)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={surprise}
          className="flex-1 rounded-full border border-accent px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/5"
        >
          Surprise me
        </button>
        <button
          type="button"
          onClick={() => setMatched(true)}
          disabled={!complete}
          className="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
        >
          It&apos;s a match!
        </button>
      </div>

      <div role="status" className="mt-5 min-h-16">
        {matched && complete && (
          <div className="bg-blush px-4 py-3 text-center">
            <p className="font-display text-2xl leading-tight">As if! It&apos;s a match ♡</p>
            <p className="mt-1 text-sm">
              {current("top").name} + {current("bottom").name} + {current("shoes").name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === "previous" ? "Previous" : "Next"} ${label.toLowerCase()}`}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg text-white hover:bg-accent-hover disabled:opacity-30"
    >
      <span aria-hidden>{direction === "previous" ? "←" : "→"}</span>
    </button>
  );
}
