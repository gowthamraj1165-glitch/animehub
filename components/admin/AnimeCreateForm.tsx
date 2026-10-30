"use client";

import { useActionState } from "react";
import { createAnimeAction } from "@/lib/admin-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";

/** Admin form: create a new catalogue anime. */
export function AnimeCreateForm() {
  const [state, formAction, pending] = useActionState(createAnimeAction, initialAuthState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">MAL id *</span>
        <input
          name="mal_id"
          type="number"
          min={1}
          required
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Title *</span>
        <input
          name="title"
          required
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">English title</span>
        <input
          name="title_english"
          defaultValue=""
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Synopsis</span>
        <textarea
          name="synopsis"
          rows={3}
          defaultValue=""
          className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Image URL</span>
        <input
          name="image_url"
          type="url"
          defaultValue=""
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Type</span>
        <input
          name="type"
          defaultValue="TV"
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
        <input
          name="status"
          defaultValue="airing"
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Year</span>
        <input name="year" type="number" min={1900} max={2100} defaultValue={2025} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Score</span>
        <input name="score" type="number" min={0} max={10} step="0.1" defaultValue={8.5} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Episode count</span>
        <input name="episode_count" type="number" min={0} defaultValue={12} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Studio</span>
        <input name="studio" defaultValue="" className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", "sm")}>
          {pending ? "Creating…" : "Create anime"}
        </button>
      </div>
    </form>
  );
}
