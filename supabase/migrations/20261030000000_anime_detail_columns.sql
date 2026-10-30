-- ============================================================================
-- AnimeHub — anime detail columns
-- ============================================================================
-- Adds the fields the /anime/[id] detail page renders:
--   * anime.studio — production studio(s) as free text
--   * episodes.season — season grouping for the episode list

alter table public.anime
  add column if not exists studio text;

alter table public.episodes
  add column if not exists season integer;
