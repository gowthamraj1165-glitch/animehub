"use client";

import { useActionState } from "react";
import { addToWatchlistAction, removeFromWatchlistAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";
import type { WatchlistEntry } from "@/lib/catalog";

type WatchlistButtonProps = {
  malId: number;
  entry: WatchlistEntry | null;
};

/** Adds the series to the signed-in user's watchlist, or removes it again. */
export function WatchlistButton({ malId, entry }: WatchlistButtonProps) {
  const [addState, addAction, addPending] = useActionState(addToWatchlistAction, initialAuthState);
  const [, removeAction, removePending] = useActionState(removeFromWatchlistAction, initialAuthState);

  if (entry) {
    return (
      <form action={removeAction}>
        <input type="hidden" name="malId" value={malId} />
        <button type="submit" disabled={removePending} className={buttonClass("secondary", "sm")}>
          {removePending ? "Removing…" : "Remove from Watchlist"}
        </button>
      </form>
    );
  }

  return (
    <form action={addAction}>
      <input type="hidden" name="malId" value={malId} />
      <input type="hidden" name="status" value="planning" />
      {addState.status === "error" && addState.message ? <AuthAlert tone="error">{addState.message}</AuthAlert> : null}
      <button type="submit" disabled={addPending} className={buttonClass("secondary", "sm")}>
        {addPending ? "Adding…" : "Add to Watchlist"}
      </button>
    </form>
  );
}
