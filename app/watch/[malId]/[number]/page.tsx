import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WatchPlayer } from "@/components/watch/WatchPlayer";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAnimeEpisodes, getWatchProgress, type AnimeRow } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Watch",
  description: "Watch an anime episode on AnimeHub.",
  robots: { index: false, follow: false },
};

export default function WatchPage({ params }: PageProps<"/watch/[malId]/[number]">) {
  return (
    <Container className="py-12 sm:py-16">
      <Suspense fallback={<p className="text-sm text-muted">Loading episode…</p>}>
        <WatchView params={params} />
      </Suspense>
    </Container>
  );
}

async function WatchView({ params }: { params: PageProps<"/watch/[malId]/[number]">["params"] }) {
  const { malId, number } = await params;
  const malIdNum = Number(malId);
  const episodeNumber = Number(number);

  // Route params are user input: reject anything that is not a positive integer.
  if (
    !Number.isInteger(malIdNum) ||
    malIdNum <= 0 ||
    !Number.isInteger(episodeNumber) ||
    episodeNumber <= 0
  ) {
    notFound();
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-line bg-surface/40 p-8 text-center">
        <h1 className="text-xl font-semibold">AnimeHub setup required</h1>
        <p className="mt-2 text-sm text-muted">Add your Supabase keys to watch episodes.</p>
        <div className="mt-6">
          <SupabaseSetupNotice />
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [episodeResult, episodes] = await Promise.all([
    supabase
      .from("episodes")
      .select("*, anime:anime(*)")
      .eq("mal_id", malIdNum)
      .eq("number", episodeNumber)
      .maybeSingle(),
    getAnimeEpisodes(malIdNum),
  ]);

  const episode = episodeResult.data;
  const anime = (episode?.anime ?? null) as AnimeRow | null;

  if (!episode || !anime) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-surface/40 p-8 text-center">
        <h1 className="text-xl font-semibold">Episode not found</h1>
        <p className="mt-2 text-sm text-muted">This episode may have been removed.</p>
        <Link href="/" className={`${buttonClass("secondary", "sm")} mt-6`}>
          Back home
        </Link>
      </div>
    );
  }

  const index = episodes.findIndex((candidate) => candidate.number === episodeNumber);
  const prev = index > 0 ? episodes[index - 1] : null;
  const next = index >= 0 && index < episodes.length - 1 ? episodes[index + 1] : null;

  const progress = await getWatchProgress(Number(episode.id));

  return (
    <>
      <WatchPlayer
        src={episode.source_url}
        episodeId={Number(episode.id)}
        initialPositionSeconds={progress?.positionSeconds ?? 0}
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={`/watch/${malIdNum}/${prev.number}`} className={buttonClass("secondary", "sm")}>
            Previous
          </Link>
        ) : (
          <span className={`${buttonClass("secondary", "sm")} pointer-events-none opacity-50`}>Previous</span>
        )}
        {next ? (
          <Link href={`/watch/${malIdNum}/${next.number}`} className={buttonClass("secondary", "sm")}>
            Next
          </Link>
        ) : (
          <span className={`${buttonClass("secondary", "sm")} pointer-events-none opacity-50`}>Next</span>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{anime.title_english ?? anime.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Episode {episode.number}
            {episode.title ? `: ${episode.title}` : ""}
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">{anime.synopsis}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Link href={`/anime/${malIdNum}`} className={buttonClass("secondary", "sm")}>
            About this series
          </Link>
          <Link href="/" className={buttonClass("secondary", "sm")}>
            Back home
          </Link>
        </div>
      </div>
    </>
  );
}
