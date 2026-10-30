import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AnimeRow = {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  image_url: string | null;
  type: string | null;
  status: string | null;
  year: number | null;
  score: number | null;
  episode_count: number | null;
  studio: string | null;
};

export type EpisodeRow = {
  id: number;
  mal_id: number;
  number: number;
  title: string | null;
  source_url: string;
  duration_seconds: number | null;
  season: number | null;
  subtitle_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  anime: AnimeRow | null;
};

export type AnimeWithGenres = AnimeRow & { anime_genres: { genre_id: number }[] };

function enabled() {
  // The app builds and prerenders without Supabase keys; catalog pages render
  // their fallbacks until the project is configured.
  return isSupabaseConfigured();
}

/** Highest-rated finished series — the hero banner pick. */
export async function getFeaturedAnime(): Promise<AnimeRow | null> {
  if (!enabled()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("anime")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .limit(1);
  return (data?.[0] ?? null) as AnimeRow | null;
}

/** Top-rated series for the "Trending" rail. */
export async function getTrendingAnime(): Promise<AnimeRow[]> {
  if (!enabled()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("anime")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .limit(12);
  return (data ?? []) as AnimeRow[];
}

/** Most recently added episodes for the "New Episodes" rail. */
export async function getNewEpisodes(): Promise<EpisodeRow[]> {
  if (!enabled()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*, anime:anime(*)")
    .order("created_at", { ascending: false })
    .limit(12);
  return (data ?? []) as EpisodeRow[];
}

/** Episodes with a playable source — the "Free to Watch" rail. */
export async function getFreeToWatchEpisodes(): Promise<EpisodeRow[]> {
  if (!enabled()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*, anime:anime(*)")
    .not("source_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(12);
  return (data ?? []) as EpisodeRow[];
}

/** First episode of a series — used for "Watch Now" deep links. */
export async function getFirstEpisode(malId: number): Promise<EpisodeRow | null> {
  if (!enabled()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*, anime:anime(*)")
    .eq("mal_id", malId)
    .order("number", { ascending: true })
    .limit(1);
  return (data?.[0] ?? null) as EpisodeRow | null;
}

/** First episode per series for a list of Jikan ids — powers watch deep links. */
export async function getFirstEpisodes(malIds: number[]): Promise<Record<number, number>> {
  const firstEpisodes: Record<number, number> = {};
  if (!enabled() || malIds.length === 0) return firstEpisodes;

  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("mal_id, number")
    .in("mal_id", malIds)
    .order("number", { ascending: true });

  for (const episode of (data ?? []) as Array<{ mal_id: number; number: number }>) {
    const malId = episode.mal_id;
    if (!(malId in firstEpisodes)) {
      firstEpisodes[malId] = episode.number;
    }
  }

  return firstEpisodes;
}

export type GenreRow = { id: number; name: string };

/** A single series joined with its genres — the /anime/[id] detail payload. */
export type AnimeDetails = { anime: AnimeRow; genres: GenreRow[] };

/** Full detail record for one series: metadata + genre list. */
export async function getAnimeById(malId: number): Promise<AnimeDetails | null> {
  if (!enabled() || !Number.isInteger(malId)) return null;

  const supabase = await createClient();
  // .maybeSingle() returns one row (or null) — indexing it with [0] was a bug
  // that made every detail page render "not found".
  const { data: animeRow } = await supabase.from("anime").select("*").eq("mal_id", malId).maybeSingle();
  const anime = (animeRow ?? null) as AnimeRow | null;
  if (!anime) return null;

  const { data: genreRows } = await supabase
    .from("anime_genres")
    .select("genre:genres(id, name)")
    .eq("mal_id", malId);
  const genres = ((genreRows ?? []) as unknown as { genre: GenreRow }[])
    .map((row) => row.genre)
    .filter((genre): genre is GenreRow => Boolean(genre));

  return { anime, genres };
}

/** All episodes of a series, ordered by season then episode number. */
export async function getAnimeEpisodes(malId: number): Promise<EpisodeRow[]> {
  if (!enabled()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*")
    .eq("mal_id", malId)
    .order("season", { ascending: true, nullsFirst: true })
    .order("number", { ascending: true });

  return (data ?? []) as EpisodeRow[];
}

export type WatchlistEntry = { status: string; is_favorite: boolean };

export type WatchProgress = { positionSeconds: number; completed: boolean };

/** The signed-in user's last playback position for one episode. */
export async function getWatchProgress(episodeId: number): Promise<WatchProgress | null> {
  if (!enabled()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("watch_history")
    .select("position_seconds, completed")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (!data) return null;
  return { positionSeconds: data.position_seconds, completed: data.completed };
}

export type WatchlistEntryWithAnime = {
  mal_id: number;
  status: string;
  is_favorite: boolean;
  anime: AnimeRow | null;
};

/** The signed-in user's watchlist, with each series joined. */
export async function getWatchlistForUser(userId: string): Promise<WatchlistEntryWithAnime[]> {
  if (!enabled()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("mal_id, status, is_favorite, anime:anime!inner(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as WatchlistEntryWithAnime[]).map((row) => ({
    ...row,
    anime: row.anime ?? null,
  }));
}

export type WatchHistoryEntry = {
  episode_id: number;
  position_seconds: number;
  completed: boolean;
  watched_at: string;
  episode: { number: number; mal_id: number; title: string | null; source_url: string } | null;
  anime: AnimeRow | null;
};

/** The signed-in user's playback history, newest first, with the series joined. */
export async function getWatchHistoryForUser(userId: string): Promise<WatchHistoryEntry[]> {
  if (!enabled()) return [];

  const supabase = await createClient();
  // watch_history has no direct FK to anime — the series is reached through
  // the episode. Embedding `anime` directly made this query fail silently.
  const { data } = await supabase
    .from("watch_history")
    .select(
      "episode_id, position_seconds, completed, watched_at, episode:episodes!inner(number, mal_id, title, source_url, anime:anime!inner(*))",
    )
    .eq("user_id", userId)
    .order("watched_at", { ascending: false });

  type RawHistoryRow = Omit<WatchHistoryEntry, "episode" | "anime"> & {
    episode: (EpisodeRow & { anime: AnimeRow | null }) | null;
  };

  return ((data ?? []) as unknown as RawHistoryRow[]).map((row) => ({
    episode_id: row.episode_id,
    position_seconds: row.position_seconds,
    completed: row.completed,
    watched_at: row.watched_at,
    episode: row.episode,
    anime: row.episode?.anime ?? null,
  }));
}

/** The signed-in user's watchlist row for a series, if any. */
export async function getWatchlistEntry(malId: number): Promise<WatchlistEntry | null> {
  if (!enabled()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("watchlist")
    .select("status, is_favorite")
    .eq("user_id", user.id)
    .eq("mal_id", malId)
    .maybeSingle();

  if (!data) return null;
  return { status: data.status, is_favorite: data.is_favorite };
}

/** All genres for the browse filter dropdown. */
export async function getGenres(): Promise<GenreRow[]> {
  if (!enabled()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("genres").select("*").order("name", { ascending: true });
  return (data ?? []) as GenreRow[];
}

/** Case-insensitive title search across the catalogue (romaji + English titles). */
export async function searchAnime(query: string, limit = 24): Promise<AnimeRow[]> {
  if (!enabled()) return [];

  // PostgREST's `or` grammar treats commas and parentheses specially, and `%`/`_`
  // are ilike wildcards — strip them so user input cannot break the filter.
  const term = query.replace(/[%_,()\\]/g, " ").replace(/\s+/g, " ").trim();
  if (!term) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("anime")
    .select("*")
    .or(`title.ilike.%${term}%,title_english.ilike.%${term}%`)
    .limit(limit);
  return (data ?? []) as AnimeRow[];
}

export type BrowseResult = {
  anime: AnimeRow[];
  genres: GenreRow[];
  years: number[];
  statuses: string[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Columns the browse grid renders — synopsis is deliberately excluded. */
type BrowseAnimeRow = Omit<AnimeRow, "synopsis"> & {
  anime_genres: { genre_id: number }[] | null;
};

/** Filtered / sorted / paginated catalogue for /browse. */
export async function getBrowseAnime({
  genre,
  year,
  status,
  sort,
  page = 1,
  pageSize = 24,
}: {
  genre?: string;
  year?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<BrowseResult> {
  if (!enabled()) {
    return {
      anime: [],
      genres: [],
      years: [],
      statuses: [],
      total: 0,
      page: 1,
      pageSize: 24,
      totalPages: 1,
    };
  }

  const supabase = await createClient();
  // Only fetch the columns the grid needs (synopsis is large and unused here),
  // and fetch genres in parallel instead of after the catalogue round-trip.
  const [animeResult, genres] = await Promise.all([
    supabase
      .from("anime")
      .select(
        "mal_id, title, title_english, image_url, type, status, year, score, episode_count, studio, anime_genres(genre_id)",
      ),
    getGenres(),
  ]);

  const rows = ((animeResult.data ?? []) as unknown as BrowseAnimeRow[]).map((row) => ({
    ...row,
    synopsis: null,
  }));

  const filtered = rows.filter((row) => {
    if (genre && !row.anime_genres?.some((link) => link.genre_id === Number(genre))) return false;
    if (year && row.year !== Number(year)) return false;
    if (status && row.status !== status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") {
      return (b.year ?? -1) - (a.year ?? -1) || b.mal_id - a.mal_id;
    }
    if (sort === "az") {
      return (a.title_english ?? a.title).localeCompare(b.title_english ?? b.title);
    }
    // "popular" (default) — rating descending.
    return (b.score ?? -1) - (a.score ?? -1) || b.mal_id - a.mal_id;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const anime = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Filter options come from the whole catalogue, not just the current result
  // set — otherwise choosing one year hides every other year from the menu.
  const years = Array.from(
    new Set(rows.map((row) => row.year).filter((value): value is number => value != null)),
  ).sort((a, b) => b - a);
  const statuses = Array.from(
    new Set(rows.map((row) => row.status).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  return { anime, genres, years, statuses, total, page: safePage, pageSize, totalPages };
}

/** Every catalogue anime, highest score first — used by the admin area. */
export async function getAllAnime(): Promise<AnimeRow[]> {
  // Defense in depth: the admin page checks the role first, but the service
  // role client bypasses RLS so every caller must be verified too.
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("anime")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false });
  return (data ?? []) as AnimeRow[];
}

/** Every episode, ordered by series then episode number — used by the admin area. */
export async function getAllEpisodes(): Promise<EpisodeRow[]> {
  const admin = await getAdminUser();
  if (!admin) return [];

  const supabase = await createAdminClient();
  const { data } = await supabase.from("episodes").select("*").order("mal_id", { ascending: true }).order("number", { ascending: true });
  return (data ?? []) as EpisodeRow[];
}
