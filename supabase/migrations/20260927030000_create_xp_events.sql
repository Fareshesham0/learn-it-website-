create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null
    check (event_type in ('lesson_completed', 'final_mission_completed', 'path_completed')),
  source_id uuid,
  xp_amount integer not null
    check (xp_amount > 0),
  event_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);

create index xp_events_user_created_idx
  on public.xp_events (user_id, created_at desc);

alter table public.xp_events enable row level security;

revoke all privileges on table public.xp_events from public, anon, authenticated;
grant select on table public.xp_events to authenticated;

create policy "Users can read their own XP events"
  on public.xp_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.award_xp_for_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_lesson record;
  published_lesson_count integer;
  completed_lesson_count integer;
begin
  if new.status <> 'completed' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'completed' then
    return new;
  end if;

  select
    lesson.id,
    lesson.path_id,
    lesson.slug
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

  insert into public.xp_events (
    user_id,
    event_type,
    source_id,
    xp_amount,
    event_key
  )
  values (
    new.user_id,
    case
      when completed_lesson.slug like 'final-mission-%' then 'final_mission_completed'
      else 'lesson_completed'
    end,
    completed_lesson.id,
    case
      when completed_lesson.slug like 'final-mission-%' then 50
      else 20
    end,
    case
      when completed_lesson.slug like 'final-mission-%' then 'final-mission:' || completed_lesson.id::text
      else 'lesson:' || completed_lesson.id::text
    end
  )
  on conflict (user_id, event_key) do nothing;

  select count(*)
  into published_lesson_count
  from public.lessons as lesson
  where lesson.path_id = completed_lesson.path_id
    and lesson.is_published = true;

  select count(*)
  into completed_lesson_count
  from public.lessons as lesson
  join public.user_lesson_progress as progress
    on progress.lesson_id = lesson.id
   and progress.user_id = new.user_id
   and progress.status = 'completed'
  where lesson.path_id = completed_lesson.path_id
    and lesson.is_published = true;

  if published_lesson_count > 0 and completed_lesson_count = published_lesson_count then
    insert into public.xp_events (
      user_id,
      event_type,
      source_id,
      xp_amount,
      event_key
    )
    values (
      new.user_id,
      'path_completed',
      completed_lesson.path_id,
      100,
      'path:' || completed_lesson.path_id::text
    )
    on conflict (user_id, event_key) do nothing;
  end if;

  return new;
end;
$$;

revoke execute
  on function public.award_xp_for_lesson_completion()
  from public, anon, authenticated;

create trigger award_xp_for_lesson_completion
  after insert or update of status on public.user_lesson_progress
  for each row execute function public.award_xp_for_lesson_completion();
