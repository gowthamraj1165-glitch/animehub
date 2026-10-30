-- ============================================================================
-- AnimeHub - complete database setup (single run)
-- ============================================================================
-- Paste this whole file into the Supabase SQL editor and press Run.
-- It applies, in order:
--   1. tables, indexes, RLS policies, triggers   (20261029000000_init)
--   2. anime.studio, episodes.season             (20261030000000_anime_detail_columns)
--   3. profiles.role, episode media columns      (20261031000000_admin_role_and_episode_fields)
--   4. block users promoting themselves to admin (20261031000001_protect_profile_role)
--
-- Run it ONCE on a fresh project. If you add migrations later, apply the
-- individual files instead - this one recreates policies and will error
-- ("already exists") if run twice.
-- ============================================================================

-- ##### 20261029000000_init.sql #####

-- ============================================================================
-- AnimeHub — initial schema
-- ============================================================================
-- Run with:  supabase db push
-- Or paste the whole file into the Supabase SQL editor.
--
-- Design notes
--   * anime / episodes / genres are a cache of Jikan + your own stream links.
--     They are read-only for clients; write them with the service role.
--   * Everything user-owned (profiles, watchlist, watch_history) is protected
--     by RLS: a signed-in user can only touch rows where user_id = auth.uid().
--   * IDs stay as Jikan's `mal_id` so no mapping table is needed.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- anime — thin cache of Jikan metadata
-- ---------------------------------------------------------------------------
create table public.anime (
  mal_id        integer primary key,                 -- Jikan / MyAnimeList id
  title         text not null,
  title_english text,
  synopsis      text,
  image_url     text,
  type          text,                                -- TV, Movie, OVA, ONA, Special...
  status        text,                                -- airing, finished, upcoming
  year          smallint,
  score         numeric(4, 2) check (score >= 0 and score <= 10),
  episode_count integer check (episode_count >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.anime is
  'Cached Jikan metadata. Populated by the app, never written by clients.';

create index anime_year_idx  on public.anime (year desc nulls last);
create index anime_score_idx on public.anime (score desc nulls last);

-- Supports: where to_tsvector('english', title || ' ' || coalesce(title_english,''))
--           @@ websearch_to_tsquery('english', $1)
create index anime_title_search_idx on public.anime
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(title_english, '')
    )
  );

create trigger anime_set_updated_at
  before update on public.anime
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- genres — Jikan genre ids are stable, so reuse them
-- ---------------------------------------------------------------------------
create table public.genres (
  id   integer primary key,        -- Jikan genre id (e.g. 1 = Action)
  name text not null unique
);

comment on table public.genres is 'Jikan genre lookup table.';


-- ---------------------------------------------------------------------------
-- anime_genres — many-to-many join
-- ---------------------------------------------------------------------------
create table public.anime_genres (
  mal_id   integer not null references public.anime (mal_id) on delete cascade,
  genre_id integer not null references public.genres (id)     on delete cascade,
  primary key (mal_id, genre_id)
);

-- Reverse lookup ("all anime in genre X"); the PK only covers mal_id first.
create index anime_genres_genre_id_idx on public.anime_genres (genre_id);


-- ---------------------------------------------------------------------------
-- episodes — the part Jikan cannot give you: playable sources
-- ---------------------------------------------------------------------------
create table public.episodes (
  id               bigint generated always as identity primary key,
  mal_id           integer not null references public.anime (mal_id) on delete cascade,
  number           integer not null check (number > 0),
  title            text,
  source_url       text not null,            -- your embed / self-hosted URL
  duration_seconds integer check (duration_seconds > 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- One row per episode per series, and doubles as the lookup index.
  unique (mal_id, number)
);

create trigger episodes_set_updated_at
  before update on public.episodes
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- profiles — public face of auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_length check (char_length(username) between 3 and 30)
);

-- Case-insensitive uniqueness: "Naruto" and "naruto" are the same handle.
create unique index profiles_username_lower_idx on public.profiles (lower(username));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- watchlist — one row per user per series
-- ---------------------------------------------------------------------------
create table public.watchlist (
  user_id     uuid not null references auth.users (id) on delete cascade,
  mal_id      integer not null references public.anime (mal_id) on delete cascade,
  status      text not null default 'planning'
              check (status in ('planning', 'watching', 'completed', 'on_hold', 'dropped')),
  score       smallint check (score between 1 and 10),
  is_favorite boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (user_id, mal_id)
);

create index watchlist_user_status_idx on public.watchlist (user_id, status);
create index watchlist_mal_id_idx     on public.watchlist (mal_id);

create trigger watchlist_set_updated_at
  before update on public.watchlist
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- watch_history — resume position per episode, overwritten as you watch
-- ---------------------------------------------------------------------------
create table public.watch_history (
  user_id          uuid not null references auth.users (id) on delete cascade,
  episode_id       bigint not null references public.episodes (id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed        boolean not null default false,
  watched_at       timestamptz not null default now(),

  primary key (user_id, episode_id)
);

-- "Continue watching" reads the newest rows for one user.
create index watch_history_user_watched_idx on public.watch_history (user_id, watched_at desc);

-- Keeps cascading deletes from episodes cheap.
create index watch_history_episode_id_idx on public.watch_history (episode_id);


-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.anime         enable row level security;
alter table public.genres        enable row level security;
alter table public.anime_genres  enable row level security;
alter table public.episodes      enable row level security;
alter table public.profiles      enable row level security;
alter table public.watchlist     enable row level security;
alter table public.watch_history enable row level security;

-- --- Public catalogue: readable by everyone, writable only by the service role
-- (no insert/update/delete policy = denied for anon and authenticated).

create policy "Catalogue is public: anime"
  on public.anime for select
  to anon, authenticated
  using (true);

create policy "Catalogue is public: genres"
  on public.genres for select
  to anon, authenticated
  using (true);

create policy "Catalogue is public: anime_genres"
  on public.anime_genres for select
  to anon, authenticated
  using (true);

create policy "Catalogue is public: episodes"
  on public.episodes for select
  to anon, authenticated
  using (true);

-- --- profiles: owner only
-- Rows are created by the auth trigger below, so no insert policy is needed,
-- and rows disappear with the auth user thanks to `on delete cascade`.

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- --- watchlist: owner only

create policy "Users can read their own watchlist"
  on public.watchlist for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add to their own watchlist"
  on public.watchlist for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own watchlist"
  on public.watchlist for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove from their own watchlist"
  on public.watchlist for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --- watch_history: owner only

create policy "Users can read their own history"
  on public.watch_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can write their own history"
  on public.watch_history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own history"
  on public.watch_history for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own history"
  on public.watch_history for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- ============================================================================
-- Auth hook: create a profile for every new user
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fallback_username text := 'user_' || left(replace(new.id::text, '-', ''), 8);
  desired_username  text := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    fallback_username
  );
begin
  insert into public.profiles (id, username)
  values (new.id, desired_username)
  on conflict (id) do nothing;

  return new;
exception
  -- The requested handle is taken: fall back to the generated one instead of
  -- failing the whole signup.
  when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, fallback_username)
    on conflict (id) do nothing;

    return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ##### 20261030000000_anime_detail_columns.sql #####

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

-- ##### 20261031000000_admin_role_and_episode_fields.sql #####

-- ============================================================================
-- AnimeHub — admin area support
-- ============================================================================
-- Adds the columns the /admin CRUD forms need:
--   * profiles.role          — 'user' (default) | 'admin'; gates /admin
--   * episodes.thumbnail_url — poster shown for the episode row
--   * episodes.subtitle_url  — subtitle track URL for the episode

alter table public.profiles
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin'));
  end if;
end $$;

alter table public.episodes
  add column if not exists thumbnail_url text;

alter table public.episodes
  add column if not exists subtitle_url text;

-- ##### 20261031000001_protect_profile_role.sql #####

-- ============================================================================
-- AnimeHub — prevent privilege escalation through profiles.role
-- ============================================================================
-- RLS is row-level only: the "Users can update their own profile" policy also
-- lets a signed-in user update every column of their own row, including
-- `role`. Without this guard, anyone could call the REST API with the public
-- anon key and their session and promote themselves to admin — which unlocks
-- every service-role admin action.
--
-- This trigger only blocks role *changes* coming from ordinary API roles.
-- The service role and direct SQL (postgres / supabase_admin, e.g. the
-- Supabase SQL editor) can still promote users.
--
-- Run this after 20261031000000_admin_role_and_episode_fields.sql.

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  claims_role text;
begin
  -- Nothing to protect when the role is unchanged (normal profile edits).
  if new.role is not distinct from old.role then
    return new;
  end if;

  -- PostgREST puts the JWT claims in this setting. Absent in the SQL editor.
  begin
    claims_role := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  exception when others then
    claims_role := null;
  end;

  -- NOTE: intentionally not a SECURITY DEFINER function, so `current_user`
  -- reflects the role PostgREST switched to for this request.
  if claims_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  raise exception 'Only the server can change profile roles.'
    using errcode = '42501';
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
