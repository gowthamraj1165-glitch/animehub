"use client";

import { useActionState } from "react";
import { createEpisodeAction } from "@/lib/admin-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";

/** Admin form: add an episode to a series with video / subtitle / thumbnail URLs. */
export function EpisodeCreateForm({ animeOptions }: { animeOptions: Array<{ malId: number; title: string }> }) {
  const [state, formAction, pending] = useActionState(createEpisodeAction, initialAuthState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Anime *</span>
        <select name="mal_id" required defaultValue={animeOptions[0]?.malId ?? ""} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
          {animeOptions.map((option) => (
            <option key={option.malId} value={option.malId}>
              {option.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Episode number *</span>
        <input name="number" type="number" min={1} required className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Title</span>
        <input name="title" defaultValue="" className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Video URL *</span>
        <input name="source_url" type="url" required className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Subtitle URL (.vtt)</span>
        <input name="subtitle_url" type="url" defaultValue="" className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Thumbnail URL</span>
        <input name="thumbnail_url" type="url" defaultValue="" className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Duration (seconds)</span>
        <input name="duration_seconds" type="number" min={0} defaultValue={0} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Season</span>
        <input name="season" type="number" min={0} defaultValue={1} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none" />
      </label>

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", "sm")}>
          {pending ? "Adding…" : "Add episode"}
        </button>
      </div>
    </form>
  );
}
