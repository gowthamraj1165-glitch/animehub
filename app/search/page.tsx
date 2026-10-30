import { Suspense } from "react";
import type { Metadata } from "next";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Container } from "@/components/ui/Container";
import { getFirstEpisodes, searchAnime } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AnimeHub for series, films and OVAs.",
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>

        {/* searchParams is request data: it must stream inside a Suspense boundary */}
        <Suspense fallback={<SearchFallback />}>
          <SearchQuery searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}

function SearchFallback() {
  return (
    <div className="mt-8 space-y-3" aria-hidden="true">
      <div className="h-4 w-40 animate-pulse rounded bg-surface" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface/60" />
    </div>
  );
}

async function SearchQuery({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  if (!query) {
    return (
      <p className="mt-6 text-sm text-muted">
        Type a title into the search bar above to get started.
      </p>
    );
  }

  const results = await searchAnime(query);
  const firstEpisodes = await getFirstEpisodes(results.map((anime) => anime.mal_id));

  if (results.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        No anime found for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-muted">
        Showing results for{" "}
        <span className="font-medium text-ink">&ldquo;{query}&rdquo;</span>{" "}
        <span className="text-xs">({results.length} found)</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((anime) => (
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
    </div>
  );
}
