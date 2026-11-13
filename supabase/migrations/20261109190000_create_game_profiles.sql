-- Robux Clicker: server-authoritative game profiles.
-- Browser clients cannot read or write this table. Only the Edge Function's
-- Supabase secret/service key accesses it.
create table if not exists public.game_profiles (
  firebase_uid text primary key,
  profile jsonb not null,
  display_name text not null default 'Oyuncu',
  total_earned numeric not null default 0,
  level integer not null default 1,
  rebirths integer not null default 0,
  leaderboard_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  constraint game_profiles_profile_object check (jsonb_typeof(profile) = 'object'),
  constraint game_profiles_display_name_length check (char_length(display_name) between 3 and 18),
  constraint game_profiles_total_nonnegative check (total_earned >= 0),
  constraint game_profiles_level_positive check (level >= 1),
  constraint game_profiles_rebirths_nonnegative check (rebirths >= 0)
);

-- Safe when the table already existed from an earlier test deployment.
alter table public.game_profiles
  add column if not exists revision bigint not null default 0;

create index if not exists game_profiles_leaderboard_idx
  on public.game_profiles (leaderboard_enabled, total_earned desc, updated_at desc);

alter table public.game_profiles enable row level security;

-- Explicitly remove browser privileges; no anon/authenticated RLS policy is created.
revoke all on table public.game_profiles from anon, authenticated;
grant all on table public.game_profiles to service_role;
