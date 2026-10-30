import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimeCreateForm } from "@/components/admin/AnimeCreateForm";
import { AnimeDeleteButton } from "@/components/admin/AnimeDeleteButton";
import { AnimeEditForm } from "@/components/admin/AnimeEditForm";
import { EpisodeCreateForm } from "@/components/admin/EpisodeCreateForm";
import { EpisodeDeleteButton } from "@/components/admin/EpisodeDeleteButton";
import { Container } from "@/components/ui/Container";
import { getAllAnime, getAllEpisodes, type EpisodeRow } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  description: "AnimeHub admin area — manage catalogue entries.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Container className="py-12 sm:py-16">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminContent />
      </Suspense>
    </Container>
  );
}

async function AdminContent() {
  const admin = await requireAdmin();
  const animeList = await getAllAnime();
  const episodes = await getAllEpisodes();

  const episodesByMalId = new Map<number, EpisodeRow[]>();
  for (const episode of episodes) {
    const list = episodesByMalId.get(episode.mal_id) ?? [];
    list.push(episode);
    episodesByMalId.set(episode.mal_id, list);
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Signed in as <span className="font-medium text-ink">{admin.email}</span> with role{" "}
        <span className="font-medium text-ink">{admin.role}</span>.
      </p>

      {/* Anime: create + edit + delete */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Anime</h2>
        <div className="mt-4 max-w-3xl">
          <AnimeCreateForm />
        </div>

        <ul className="mt-8 space-y-6">
          {animeList.map((anime) => (
            <li key={anime.mal_id} className="rounded-2xl border border-line bg-surface/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{anime.title_english ?? anime.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    MAL {anime.mal_id}
                    {anime.status ? ` · ${anime.status}` : ""}
                    {anime.year ? ` · ${anime.year}` : ""}
                    {anime.score ? ` · ★ ${anime.score.toFixed(1)}` : ""}
                  </p>
                </div>
                <AnimeDeleteButton malId={anime.mal_id} />
              </div>
              <div className="mt-4">
                <AnimeEditForm malId={anime.mal_id} anime={anime} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Episodes: create + delete */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Episodes</h2>
        <div className="mt-4 max-w-3xl">
          <EpisodeCreateForm animeOptions={animeList.map((anime) => ({ malId: anime.mal_id, title: anime.title_english ?? anime.title }))} />
        </div>

        <div className="mt-8 space-y-8">
          {Array.from(episodesByMalId.entries()).map(([malId, list]) => {
            const anime = animeList.find((candidate) => candidate.mal_id === malId);
            const animeTitle = anime?.title_english ?? anime?.title ?? `MAL ${malId}`;
            return (
              <div key={malId} className="rounded-2xl border border-line bg-surface/60 p-4">
                <h3 className="text-sm font-semibold">{animeTitle}</h3>
                <ul className="mt-3 space-y-2">
                  {list.map((episode) => (
                    <li key={episode.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/60 px-3 py-2">
                      <p className="text-sm">
                        Ep {episode.number}
                        {episode.title ? `: ${episode.title}` : ""}
                      </p>
                      <div className="flex items-center gap-3">
                        {episode.source_url ? (
                          <a href={episode.source_url} target="_blank" rel="noreferrer" className="text-xs text-accent-soft underline-offset-4 hover:underline">
                            Video
                          </a>
                        ) : null}
                        {episode.subtitle_url ? (
                          <a href={episode.subtitle_url} target="_blank" rel="noreferrer" className="text-xs text-accent-soft underline-offset-4 hover:underline">
                            Subs
                          </a>
                        ) : null}
                        <EpisodeDeleteButton malId={episode.mal_id} number={episode.number} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="py-12 sm:py-16" aria-hidden="true">
      <div className="h-8 w-48 animate-pulse rounded bg-surface" />
      <div className="mt-8 h-64 w-full max-w-3xl animate-pulse rounded-2xl border border-line bg-surface/60" />
    </div>
  );
}
