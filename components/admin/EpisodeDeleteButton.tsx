"use client";

import { useActionState } from "react";
import { deleteEpisodeAction } from "@/lib/admin-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";

type EpisodeDeleteButtonProps = {
  malId: number;
  number: number;
};

/** Admin: delete one episode of a series. */
export function EpisodeDeleteButton({ malId, number }: EpisodeDeleteButtonProps) {
  const [state, formAction, pending] = useActionState(deleteEpisodeAction, initialAuthState);

  return (
    <form action={formAction}>
      <input type="hidden" name="mal_id" value={malId} />
      <input type="hidden" name="number" value={number} />
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}
      <button type="submit" disabled={pending} className={buttonClass("secondary", "sm")}>
        {pending ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}
