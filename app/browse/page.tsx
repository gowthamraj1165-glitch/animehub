import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";
import { getBrowseAnime, getFirstEpisodes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse, filter and sort the full AnimeHub catalogue.",
};

const PAGE_SIZE = 24;

export default function BrowsePage({ searchParams }: PageProps<"/browse">) {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Browse</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Pick a genre, filter by year or status, and sort the catalogue to find
        your next watch.
      </p>

      <Suspense fallback={<BrowseFallback />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

function BrowseFallback() {
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="h-10 w-full max-w-3xl animate-pulse rounded-2xl bg-surface/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 w-full animate-pulse rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

async function BrowseContent({
  searchParams,
}: {
  searchParams: PageProps<"/browse">["searchParams"];
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const genre = typeof params.genre === "string" ? params.genre : "";
  const year = typeof params.year === "string" ? params.year : "";
  const status = typeof params.status === "string" ? params.status : "";
  const sort = typeof params.sort === "string" ? params.sort : "popular";

  const result = await getBrowseAnime({ genre, year, status, sort, page, pageSize: PAGE_SIZE });

  const firstEpisodes = await getFirstEpisodes(result.anime.map((anime) => anime.mal_id));

  const buildHref = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (genre) sp.set("genre", genre);
    if (year) sp.set("year", year);
    if (status) sp.set("status", status);
    if (sort && sort !== "popular") sp.set("sort", sort);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `/browse?${qs}` : "/browse";
  };

  return (
    <>
      <form
        method="get"
        action="/browse"
        className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface/60 p-4"
      >
        <div>
          <label htmlFor="browse-genre" className="sr-only">
            Genre
          </label>
          <select
            id="browse-genre"
            name="genre"
            defaultValue={genre}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="">All genres</option>
            {result.genres.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="browse-year" className="sr-only">
            Year
          </label>
          <select
            id="browse-year"
            name="year"
            defaultValue={year}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="">Any year</option>
            {result.years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="browse-status" className="sr-only">
            Status
          </label>
          <select
            id="browse-status"
            name="status"
            defaultValue={status}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="">Any status</option>
            {result.statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="browse-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="browse-sort"
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
          >
            <option value="popular">Most popular</option>
            <option value="newest">Newest</option>
            <option value="az">A–Z</option>
          </select>
        </div>

        <input type="hidden" name="page" value="1" />
        <button type="submit" className={buttonClass("primary", "sm")}>
          Apply filters
        </button>
      </form>

      {result.anime.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.anime.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              malId={anime.mal_id}
              title={anime.title_english ?? anime.title}
              imageUrl={anime.image_url}
              score={anime.score}
              className="w-full"
              href={`/watch/${anime.mal_id}/${firstEpisodes[anime.mal_id] ?? 1}`}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">No anime match those filters yet.</p>
      )}

      {result.totalPages > 1 ? (
        <nav aria-label="Browse pagination" className="mt-10 flex items-center justify-between">
          {result.page > 1 ? (
            <Link href={buildHref(result.page - 1)} className={buttonClass("secondary", "sm")}>
              Previous
            </Link>
          ) : (
            <span className={`${buttonClass("secondary", "sm")} pointer-events-none opacity-50`}>Previous</span>
          )}
          <p className="text-sm text-muted">
            Page {result.page} of {result.totalPages}
          </p>
          {result.page < result.totalPages ? (
            <Link href={buildHref(result.page + 1)} className={buttonClass("secondary", "sm")}>
              Next
            </Link>
          ) : (
            <span className={`${buttonClass("secondary", "sm")} pointer-events-none opacity-50`}>Next</span>
          )}
        </nav>
      ) : null}
    </>
  );
}
