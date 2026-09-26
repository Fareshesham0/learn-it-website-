create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (char_length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null
    check (char_length(btrim(title)) between 1 and 160),
  description text,
  icon text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  slug text not null
    check (char_length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null
    check (char_length(btrim(title)) between 1 and 160),
  summary text,
  learning_mode text not null default 'All'
    check (learning_mode in ('All', 'Explorer', 'Learner', 'Technical')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (path_id, slug)
);

create table public.user_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create function public.set_user_lesson_progress_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger set_user_lesson_progress_updated_at
  before update on public.user_lesson_progress
  for each row execute function public.set_user_lesson_progress_updated_at();

create index learning_paths_published_order_idx
  on public.learning_paths (sort_order, title)
  where is_published = true;

create index lessons_path_order_idx
  on public.lessons (path_id, sort_order)
  where is_published = true;

create index user_lesson_progress_updated_idx
  on public.user_lesson_progress (user_id, updated_at desc);

create index user_lesson_progress_lesson_idx
  on public.user_lesson_progress (lesson_id);

alter table public.learning_paths enable row level security;
alter table public.lessons enable row level security;
alter table public.user_lesson_progress enable row level security;

revoke all privileges on table public.learning_paths from public, anon, authenticated;
grant select on table public.learning_paths to anon, authenticated;

revoke all privileges on table public.lessons from public, anon, authenticated;
grant select on table public.lessons to anon, authenticated;

revoke all privileges on table public.user_lesson_progress from public, anon, authenticated;
grant select, insert, update, delete on table public.user_lesson_progress to authenticated;

create policy "Anyone can read published learning paths"
  on public.learning_paths for select
  to anon, authenticated
  using (is_published = true);

create policy "Anyone can read published lessons"
  on public.lessons for select
  to anon, authenticated
  using (
    is_published = true
    and exists (
      select 1
      from public.learning_paths as learning_path
      where learning_path.id = lessons.path_id
        and learning_path.is_published = true
    )
  );

create policy "Users can read their own lesson progress"
  on public.user_lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own lesson progress"
  on public.user_lesson_progress for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.lessons as lesson
      join public.learning_paths as learning_path
        on learning_path.id = lesson.path_id
      where lesson.id = user_lesson_progress.lesson_id
        and lesson.is_published = true
        and learning_path.is_published = true
    )
  );

create policy "Users can update their own lesson progress"
  on public.user_lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.lessons as lesson
      join public.learning_paths as learning_path
        on learning_path.id = lesson.path_id
      where lesson.id = user_lesson_progress.lesson_id
        and lesson.is_published = true
        and learning_path.is_published = true
    )
  );

create policy "Users can delete their own lesson progress"
  on public.user_lesson_progress for delete
  to authenticated
  using ((select auth.uid()) = user_id);