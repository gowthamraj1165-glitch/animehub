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
