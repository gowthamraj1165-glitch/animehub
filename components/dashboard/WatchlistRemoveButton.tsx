"use client";

import { useActionState } from "react";
import { removeFromWatchlistAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";

type WatchlistRemoveButtonProps = {
  malId: number;
  /** Where to send the user after removal (defaults handled server-side). */
  redirectTo: string;
};

/** Remove one watchlist entry, then bounce the user back to a target page. */
export function WatchlistRemoveButton({ malId, redirectTo }: WatchlistRemoveButtonProps) {
  const [state, formAction, pending] = useActionState(removeFromWatchlistAction, initialAuthState);

  return (
    <form action={formAction}>
      <input type="hidden" name="malId" value={malId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}
      <button type="submit" disabled={pending} className={buttonClass("secondary", "sm")}>
        {pending ? "Removing…" : "Remove"}
      </button>
    </form>
  );
}
