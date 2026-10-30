import { Suspense } from "react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";
import {
  getFeaturedAnime,
  getFirstEpisodes,
  getFreeToWatchEpisodes,
  getNewEpisodes,
  getTrendingAnime,
  type AnimeRow,
} from "@/lib/catalog";

export const metadata: Metadata = {
  description:
    "Browse trending anime, new episodes and free-to-watch series — then track what you watch.",
};

export default function Home() {
  // The hero + rails read the database through the Supabase cookie client,
  // so this page streams its content behind a Suspense boundary (Cache Components).
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [featured, trending, newEpisodes, freeToWatch] = await Promise.all([
    getFeaturedAnime(),
    getTrendingAnime(),
    getNewEpisodes(),
    getFreeToWatchEpisodes(),
  ]);

  const firstEpisodes = trending.length > 0 ? await getFirstEpisodes(trending.map((anime) => anime.mal_id)) : {};

  return (
    <>
      {featured ? (
        <FeaturedHero
          anime={featured}
          watchHref={`/watch/${featured.mal_id}/${firstEpisodes[featured.mal_id] ?? 1}`}
        />
      ) : null}

      {trending.length > 0 ? (
        <Row id="home-trending" title="Trending">
          {trending.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              malId={anime.mal_id}
              title={anime.title_english ?? anime.title}
              imageUrl={anime.image_url}
              score={anime.score}
              href={`/watch/${anime.mal_id}/${firstEpisodes[anime.mal_id] ?? 1}`}
            />
          ))}
        </Row>
      ) : null}

      {newEpisodes.length > 0 ? (
        <Row id="home-new-episodes" title="New Episodes">
          {newEpisodes.map((episode) => (
            <AnimeCard
              key={episode.id}
              malId={episode.mal_id}
              title={episode.anime?.title_english ?? episode.anime?.title ?? `Episode ${episode.number}`}
              imageUrl={episode.anime?.image_url ?? null}
              score={episode.anime?.score ?? null}
              episodeNumber={episode.number}
              href={`/watch/${episode.mal_id}/${episode.number}`}
            />
          ))}
        </Row>
      ) : null}

      {freeToWatch.length > 0 ? (
        <Row id="home-free" title="Free to Watch">
          {freeToWatch.map((episode) => (
            <AnimeCard
              key={episode.id}
              malId={episode.mal_id}
              title={episode.anime?.title_english ?? episode.anime?.title ?? `Episode ${episode.number}`}
              imageUrl={episode.anime?.image_url ?? null}
              score={episode.anime?.score ?? null}
              episodeNumber={episode.number}
              href={`/watch/${episode.mal_id}/${episode.number}`}
            />
          ))}
        </Row>
      ) : null}
    </>
  );
}

function FeaturedHero({ anime, watchHref }: { anime: AnimeRow; watchHref: string }) {
  const title = anime.title_english ?? anime.title;

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -top-24 right-[12%] size-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <Container className="py-12 sm:py-16">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          {/* Poster */}
          <div className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-surface sm:mx-0">
            {anime.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- poster comes from the anime table / Jikan CDN
              <img src={anime.image_url} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent/15">
                <span className="text-5xl font-semibold text-accent-soft">{title.slice(0, 1)}</span>
              </div>
            )}
          </div>

          {/* Copy */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Featured series
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>

            <p className="mt-3 text-sm text-accent-soft font-medium">
              ★ {anime.score != null ? anime.score.toFixed(1) : "N/A"}
              {anime.type ? ` · ${anime.type}` : ""}
              {anime.year ? ` · ${anime.year}` : ""}
            </p>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted">{anime.synopsis}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={watchHref} className={buttonClass("primary")}>
                Watch Now
              </Link>
              <Link href="/search" className={buttonClass("secondary")}>
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Row({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <Container>
        <div className="mt-14 flex items-baseline justify-between border-b border-line pb-4">
          <h2 id={id} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <Link href="/search" className="text-sm text-accent-soft underline-offset-4 hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </Container>
    </section>
  );
}

function HomeFallback() {
  return (
    <>
      <section className="relative isolate overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <Container className="py-12 sm:py-16">
          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div className="aspect-[2/3] w-full max-w-xs animate-pulse rounded-2xl border border-line bg-surface sm:mx-0" />
            <div>
              <div className="h-6 w-32 animate-pulse rounded-full bg-surface" />
              <div className="mt-5 h-9 w-2/3 animate-pulse rounded bg-surface" />
              <div className="mt-6 h-4 w-1/2 animate-pulse rounded bg-surface" />
              <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-surface" />
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-20">
        <div className="mt-14 h-6 w-44 animate-pulse rounded bg-surface" />
        <div className="mt-6 flex gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 w-[148px] shrink-0 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      </Container>
    </>
  );
}
