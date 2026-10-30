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
