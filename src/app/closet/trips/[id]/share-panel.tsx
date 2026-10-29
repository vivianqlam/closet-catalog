"use client";

import { useState, useTransition } from "react";
import { startSharing, stopSharing } from "../actions";

// Turn the read-only link on or off, and copy it to send to friends.
export function SharePanel({ tripId, shareUrl }: { tripId: string; shareUrl: string | null }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttonClass = "rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink disabled:opacity-60";

  return (
    <div className="mt-6 border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label !text-ink">Share packing list</p>
          <p className="mt-0.5 text-sm text-muted">
            {shareUrl
              ? "Anyone with this link can see this trip's list and photos. They can't edit anything or see the rest of your closet."
              : "Make a read-only link so friends can see what you're packing."}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => (shareUrl ? stopSharing(tripId) : startSharing(tripId)))}
          className={shareUrl ? `${buttonClass} text-accent` : "rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60"}
        >
          {pending ? "Saving…" : shareUrl ? "Turn off link" : "Create share link"}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-3 flex gap-2">
          <label htmlFor="share-url" className="sr-only">
            Share link
          </label>
          <input
            id="share-url"
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 border border-line bg-transparent px-3 py-1.5 text-sm text-muted"
          />
          <button type="button" onClick={copy} className={buttonClass}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
