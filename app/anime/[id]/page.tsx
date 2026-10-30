import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WatchlistButton } from "@/components/anime/WatchlistButton";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";
import { getAnimeById, getAnimeEpisodes, getWatchlistEntry } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Anime",
  description: "An anime series on AnimeHub — episodes, genres and watch actions.",
};

export default function AnimePage({ params }: PageProps<"/anime/[id]">) {
  return (
    <Container className="py-12 sm:py-16">
      <Suspense fallback={<AnimeFallback />}>
        <AnimeView params={params} />
      </Suspense>
    </Container>
  );
}

async function AnimeView({ params }: { params: PageProps<"/anime/[id]">["params"] }) {
  const { id } = await params;
  const malId = Number(id);

  if (!Number.isInteger(malId) || malId <= 0) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-line bg-surface/40 p-8 text-center">
        <h1 className="text-xl font-semibold">AnimeHub setup required</h1>
        <p className="mt-2 text-sm text-muted">Add your Supabase keys to browse the catalogue.</p>
        <div className="mt-6">
          <SupabaseSetupNotice />
        </div>
      </div>
    );
  }

  const [entry, details, episodes] = await Promise.all([
    getWatchlistEntry(malId),
    getAnimeById(malId),
    getAnimeEpisodes(malId),
  ]);

  if (!details) notFound();

  const { anime, genres } = details;
  const watchHref = `/watch/${malId}/${episodes[0]?.number ?? 1}`;
  const title = anime.title_english ?? anime.title;

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-line bg-surface">
          {anime.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- poster comes from the anime table / Jikan CDN
            <img src={anime.image_url} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/15">
              <span className="text-5xl font-semibold text-accent-soft">{title.slice(0, 1)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>

          <p className="mt-2 text-sm font-medium text-accent-soft">
            ★ {anime.score != null ? anime.score.toFixed(1) : "N/A"}
            {anime.type ? ` · ${anime.type}` : ""}
            {anime.year ? ` · ${anime.year}` : ""}
          </p>
          {anime.status ? <p className="mt-1 text-sm text-muted">Status: {anime.status}</p> : null}
          {anime.studio ? <p className="mt-1 text-sm text-muted">Studio: {anime.studio}</p> : null}

          {genres.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/browse?genre=${genre.id}`}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-accent/60 hover:text-ink"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          ) : null}

          {anime.synopsis ? <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{anime.synopsis}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={watchHref} className={buttonClass("primary")}>
              Watch Now
            </Link>
            <WatchlistButton malId={malId} entry={entry} />
          </div>
        </div>
      </div>

      {/* Episodes */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Episodes</h2>
        {episodes.length > 0 ? (
          <ol className="mt-6 space-y-3">
            {episodes.map((episode) => {
              const thumbnail = episode.thumbnail_url ?? anime.image_url;
              return (
                <li
                  key={episode.id}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-3"
                >
                  <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element -- episode thumbnails come from admin-managed URLs
                      <img src={thumbnail} alt={title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-accent/15">
                        <span className="text-2xl font-semibold text-accent-soft">{title.slice(0, 1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Episode {episode.number}
                      {episode.title ? `: ${episode.title}` : ""}
                    </p>
                    {episode.season ? <p className="mt-0.5 text-xs text-muted">Season {episode.season}</p> : null}
                    <p className="mt-1 text-xs text-muted">{formatDuration(episode.duration_seconds)}</p>
                  </div>

                  {episode.source_url ? (
                    <Link href={`/watch/${malId}/${episode.number}`} className={buttonClass("secondary", "sm")}>
                      Play
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-6 text-sm text-muted">No episodes are linked for this series yet.</p>
        )}
      </section>
    </>
  );
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "Full episode";
  return `${Math.round(seconds / 60)} min`;
}

function AnimeFallback() {
  return (
    <div className="grid gap-8 sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)]" aria-hidden="true">
      <div className="aspect-[2/3] w-full animate-pulse rounded-2xl border border-line bg-surface" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
        <div className="h-4 w-full animate-pulse rounded bg-surface" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
        <div className="h-11 w-40 animate-pulse rounded-full bg-surface" />
      </div>
    </div>
  );
}
