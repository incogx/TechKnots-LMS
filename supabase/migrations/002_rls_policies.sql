-- Row Level Security policies

alter table public.users enable row level security;
alter table public.user_stats enable row level security;
alter table public.enrollments enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenge_completions enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.courses enable row level security;
alter table public.achievements enable row level security;

-- users
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users for select
using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
on public.users for insert
with check (auth.uid() = id);

-- user_stats
drop policy if exists "user_stats_select_own" on public.user_stats;
create policy "user_stats_select_own"
on public.user_stats for select
using (auth.uid() = user_id);

drop policy if exists "user_stats_mutate_own" on public.user_stats;
create policy "user_stats_mutate_own"
on public.user_stats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- enrollments
drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own"
on public.enrollments for select
using (auth.uid() = user_id);

drop policy if exists "enrollments_mutate_own" on public.enrollments;
create policy "enrollments_mutate_own"
on public.enrollments for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- user_achievements
drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
on public.user_achievements for select
using (auth.uid() = user_id);

drop policy if exists "user_achievements_mutate_own" on public.user_achievements;
create policy "user_achievements_mutate_own"
on public.user_achievements for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- daily_challenge_completions
drop policy if exists "daily_challenges_select_own" on public.daily_challenge_completions;
create policy "daily_challenges_select_own"
on public.daily_challenge_completions for select
using (auth.uid() = user_id);

drop policy if exists "daily_challenges_mutate_own" on public.daily_challenge_completions;
create policy "daily_challenges_mutate_own"
on public.daily_challenge_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- leaderboard and catalog data readable by authenticated users
drop policy if exists "leaderboard_read_authenticated" on public.leaderboard_entries;
create policy "leaderboard_read_authenticated"
on public.leaderboard_entries for select
using (auth.role() = 'authenticated');

drop policy if exists "courses_read_authenticated" on public.courses;
create policy "courses_read_authenticated"
on public.courses for select
using (auth.role() = 'authenticated');

drop policy if exists "achievements_read_authenticated" on public.achievements;
create policy "achievements_read_authenticated"
on public.achievements for select
using (auth.role() = 'authenticated');
