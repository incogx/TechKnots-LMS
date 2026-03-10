-- Initial TechKnots schema for Supabase/PostgreSQL

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  role text not null default 'student' check (role in ('student', 'mentor', 'admin', 'instructor')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  points integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_streak_date date,
  total_problems_solved integer not null default 0,
  total_courses_completed integer not null default 0,
  problems_solved_today integer not null default 0,
  points_earned_today integer not null default 0,
  points_earned_this_week integer not null default 0,
  points_earned_this_month integer not null default 0,
  last_updated timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  category text,
  level text,
  tags text[] default '{}',
  rating numeric(3, 2) default 0,
  students integer not null default 0,
  lessons jsonb not null default '[]'::jsonb,
  duration text,
  instructor text,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  completed_lessons text[] not null default '{}',
  enrolled_at timestamptz not null default now(),
  last_accessed timestamptz not null default now(),
  completed_at timestamptz,
  points_earned integer not null default 0,
  xp_earned integer not null default 0,
  unique (user_id, course_id)
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  category text not null check (category in ('challenges', 'problems', 'streaks', 'milestones', 'points', 'courses')),
  points integer not null default 0,
  requirement integer not null default 1,
  icon text,
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  progress integer,
  unique (user_id, achievement_id)
);

create table if not exists public.daily_challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id text not null,
  completed_at timestamptz not null default now(),
  points_earned integer not null default 0,
  xp_earned integer not null default 0
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  timeframe text not null default 'global' check (timeframe in ('global', 'weekly')),
  score integer not null default 0,
  rank integer,
  problems_solved integer not null default 0,
  level integer not null default 1,
  avatar text,
  updated_at timestamptz not null default now(),
  unique (user_id, timeframe)
);

create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);
create index if not exists idx_leaderboard_timeframe_rank on public.leaderboard_entries(timeframe, rank);
