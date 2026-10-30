-- ============================================================================
-- AnimeHub — development seed
-- ============================================================================
-- Runs automatically on `supabase db reset` (via supabase/config.toml) and can
-- be re-run safely in the SQL editor: every statement upserts.
--
-- Notes
--   * `image_url` is intentionally NULL. The app fills it from Jikan on first
--     view, and the upsert below will not overwrite an image that already
--     exists.
--   * Episode `source_url` values are placeholders. Replace them with your own
--     licensed embeds before wiring the player. Episodes are inserted with
--     `on conflict do nothing` so re-seeding never clobbers a real URL.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Anime
-- ---------------------------------------------------------------------------
insert into public.anime
  (mal_id, title, title_english, synopsis, image_url, type, status, year, score, episode_count)
values
  (
    1,
    'Cowboy Bebop',
    'Cowboy Bebop',
    'A ragtag crew of bounty hunters drift between planets chasing criminals for cash, while each of them quietly runs from a past they cannot outrun.',
    null, 'TV', 'finished', 1998, 8.75, 26
  ),
  (
    5114,
    'Hagane no Renkinjutsushi: Fullmetal Alchemist',
    'Fullmetal Alchemist: Brotherhood',
    'Two brothers pay a terrible price for forbidden alchemy and set out to restore what they lost, uncovering a conspiracy that reaches the top of the state.',
    null, 'TV', 'finished', 2009, 9.10, 64
  ),
  (
    1535,
    'Death Note',
    'Death Note',
    'A gifted student finds a notebook that kills anyone whose name is written in it, and the detective hunting him is every bit his equal.',
    null, 'TV', 'finished', 2006, 8.62, 37
  ),
  (
    16498,
    'Shingeki no Kyojin',
    'Attack on Titan',
    'Humanity hides behind enormous walls from man-eating giants, until the day the walls stop being enough.',
    null, 'TV', 'finished', 2013, 8.54, 25
  ),
  (
    52991,
    'Sousou no Frieren',
    'Frieren: Beyond Journey''s End',
    'An elf mage outlives the party that defeated the demon king and sets out to understand the people she only briefly knew.',
    null, 'TV', 'finished', 2023, 9.31, 28
  )
on conflict (mal_id) do update set
  title         = excluded.title,
  title_english = excluded.title_english,
  synopsis      = excluded.synopsis,
  image_url     = coalesce(excluded.image_url, public.anime.image_url),
  type          = excluded.type,
  status        = excluded.status,
  year          = excluded.year,
  score         = excluded.score,
  episode_count = excluded.episode_count;


-- ---------------------------------------------------------------------------
-- Genres (ids match Jikan)
-- ---------------------------------------------------------------------------
insert into public.genres (id, name) values
  (1,  'Action'),
  (2,  'Adventure'),
  (7,  'Mystery'),
  (8,  'Drama'),
  (10, 'Fantasy'),
  (24, 'Sci-Fi'),
  (27, 'Shounen'),
  (37, 'Supernatural'),
  (40, 'Psychological'),
  (41, 'Thriller')
on conflict (id) do update set name = excluded.name;


-- ---------------------------------------------------------------------------
-- Anime ↔ genre links
-- ---------------------------------------------------------------------------
insert into public.anime_genres (mal_id, genre_id) values
  -- Cowboy Bebop
  (1, 1), (1, 2), (1, 24),
  -- Fullmetal Alchemist: Brotherhood
  (5114, 1), (5114, 2), (5114, 8), (5114, 10), (5114, 27),
  -- Death Note
  (1535, 7), (1535, 27), (1535, 37), (1535, 40), (1535, 41),
  -- Attack on Titan
  (16498, 1), (16498, 8), (16498, 27),
  -- Frieren
  (52991, 2), (52991, 8), (52991, 10), (52991, 27)
on conflict do nothing;


-- ---------------------------------------------------------------------------
-- Episodes (placeholder sources — see the header note)
-- ---------------------------------------------------------------------------
insert into public.episodes (mal_id, number, title, source_url, duration_seconds) values
  (1, 1, 'Asteroid Blues',        'https://example.com/embed/cowboy-bebop/1', 1440),
  (1, 2, 'Stray Dog Strut',       'https://example.com/embed/cowboy-bebop/2', 1440),
  (1, 3, 'Honky Tonk Women',      'https://example.com/embed/cowboy-bebop/3', 1440),
  (52991, 1, 'The Journey''s End', 'https://example.com/embed/frieren/1',     1440),
  (52991, 2, 'It Didn''t Have to Be Magic...', 'https://example.com/embed/frieren/2', 1440)
on conflict (mal_id, number) do nothing;

commit;
