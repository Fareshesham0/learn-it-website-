create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null
    check (char_length(slug) between 1 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null
    check (char_length(btrim(title)) between 1 and 80),
  description text not null
    check (char_length(btrim(description)) between 1 and 240),
  icon text
    check (icon is null or char_length(btrim(icon)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index user_badges_awarded_idx
  on public.user_badges (user_id, awarded_at desc);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

revoke all privileges on table public.badges from public, anon, authenticated;
grant select on table public.badges to anon, authenticated;

revoke all privileges on table public.user_badges from public, anon, authenticated;
grant select on table public.user_badges to authenticated;

create policy "Anyone can read badge definitions"
  on public.badges for select
  to anon, authenticated
  using (true);

create policy "Users can read their own badges"
  on public.user_badges for select
  to authenticated
  using ((select auth.uid()) = user_id);

insert into public.badges (slug, title, description, icon)
values
  ('first-steps', 'First Steps', 'Complete your first lesson.', '1'),
  ('computer-explorer', 'Computer Explorer', 'Complete 3 lessons in the Computer Basics path.', '3'),
  ('final-mission', 'Final Mission', 'Complete the final mission in Computer Basics.', 'F'),
  ('computer-basics-complete', 'Computer Basics Complete', 'Complete every published lesson in the Computer Basics path.', 'C')
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    icon = excluded.icon;

create function public.award_badges_for_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_lesson record;
  total_completed_published_lessons integer;
  computer_basics_completed_lessons integer;
  computer_basics_published_lessons integer;
begin
  if new.status <> 'completed' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'completed' then
    return new;
  end if;

  select
    lesson.id,
    lesson.slug,
    learning_path.id as path_id,
    learning_path.slug as path_slug
  into completed_lesson
  from public.lessons as lesson
  join public.learning_paths as learning_path
    on learning_path.id = lesson.path_id
  where lesson.id = new.lesson_id
    and lesson.is_published = true
    and learning_path.is_published = true;

  if completed_lesson.id is null then
    return new;
  end if;

  select count(*)
  into total_completed_published_lessons
  from public.user_lesson_progress as progress
  join public.lessons as lesson
    on lesson.id = progress.lesson_id
  join public.learning_paths as learning_path
    on learning_path.id = lesson.path_id
  where progress.user_id = new.user_id
    and progress.status = 'completed'
    and lesson.is_published = true
    and learning_path.is_published = true;

  if total_completed_published_lessons >= 1 then
    insert into public.user_badges (user_id, badge_id)
    select new.user_id, badge.id
    from public.badges as badge
    where badge.slug = 'first-steps'
    on conflict (user_id, badge_id) do nothing;
  end if;

  select count(*)
  into computer_basics_completed_lessons
  from public.user_lesson_progress as progress
  join public.lessons as lesson
    on lesson.id = progress.lesson_id
  join public.learning_paths as learning_path
    on learning_path.id = lesson.path_id
  where progress.user_id = new.user_id
    and progress.status = 'completed'
    and lesson.is_published = true
    and learning_path.slug = 'computer-basics'
    and learning_path.is_published = true;

  if computer_basics_completed_lessons >= 3 then
    insert into public.user_badges (user_id, badge_id)
    select new.user_id, badge.id
    from public.badges as badge
    where badge.slug = 'computer-explorer'
    on conflict (user_id, badge_id) do nothing;
  end if;

  if completed_lesson.path_slug = 'computer-basics'
    and completed_lesson.slug = 'final-mission-meet-the-computer'
  then
    insert into public.user_badges (user_id, badge_id)
    select new.user_id, badge.id
    from public.badges as badge
    where badge.slug = 'final-mission'
    on conflict (user_id, badge_id) do nothing;
  end if;

  select count(*)
  into computer_basics_published_lessons
  from public.lessons as lesson
  join public.learning_paths as learning_path
    on learning_path.id = lesson.path_id
  where learning_path.slug = 'computer-basics'
    and learning_path.is_published = true
    and lesson.is_published = true;

  if computer_basics_published_lessons > 0
    and computer_basics_completed_lessons = computer_basics_published_lessons
  then
    insert into public.user_badges (user_id, badge_id)
    select new.user_id, badge.id
    from public.badges as badge
    where badge.slug = 'computer-basics-complete'
    on conflict (user_id, badge_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute
  on function public.award_badges_for_lesson_completion()
  from public, anon, authenticated;

create trigger award_badges_for_lesson_completion
  after insert or update of status on public.user_lesson_progress
  for each row execute function public.award_badges_for_lesson_completion();
