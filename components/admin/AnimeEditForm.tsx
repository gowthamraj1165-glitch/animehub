"use client";

import { useActionState } from "react";
import { updateAnimeAction } from "@/lib/admin-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { buttonClass } from "@/components/ui/button";
import type { AnimeRow } from "@/lib/catalog";

type AnimeEditFormProps = {
  malId: number;
  anime: AnimeRow;
};

/** Admin form: edit an existing catalogue anime (mal_id-keyed). */
export function AnimeEditForm({ malId, anime }: AnimeEditFormProps) {
  const [state, formAction, pending] = useActionState(updateAnimeAction, initialAuthState);

  const textInput = (
    name: string,
    label: string,
    value: string,
    type: "text" | "url" = "text",
    options?: { required?: boolean; defaultValue?: string },
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={options?.defaultValue ?? value}
        required={options?.required}
        className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
      />
    </label>
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-line bg-surface/60 p-4 sm:grid-cols-2">
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}

      <input type="hidden" name="mal_id" value={malId} />

      {textInput("title", "Title *", anime.title, "text", { required: true })}
      {textInput("title_english", "English title", anime.title_english ?? "", "text")}
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Synopsis</span>
        <textarea
          name="synopsis"
          rows={3}
          defaultValue={anime.synopsis ?? ""}
          className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      {textInput("image_url", "Image URL", anime.image_url ?? "", "url")}
      {textInput("type", "Type", anime.type ?? "TV")}
      {textInput("status", "Status", anime.status ?? "airing")}
      {textInput("studio", "Studio", anime.studio ?? "")}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Year</span>
        <input
          name="year"
          type="number"
          min={1900}
          max={2100}
          defaultValue={anime.year ?? undefined}
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Score</span>
        <input
          name="score"
          type="number"
          min={0}
          max={10}
          step="0.1"
          defaultValue={anime.score ?? undefined}
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Episode count</span>
        <input
          name="episode_count"
          type="number"
          min={0}
          defaultValue={anime.episode_count ?? undefined}
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        />
      </label>

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", "sm")}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
