with computer_basics as (
  insert into public.learning_paths (
    slug,
    title,
    description,
    sort_order,
    is_published
  )
  values (
    'computer-basics',
    'Computer Basics',
    'Learn the essential parts of a computer, how they work together, and the basic skills needed to use one confidently.',
    1,
    true
  )
  on conflict (slug) do update
  set title = excluded.title,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_published = excluded.is_published
  returning id
), lesson_seed (slug, title, summary, estimated_minutes, sort_order) as (
  values
    ('what-is-a-computer', 'What Is a Computer?', 'Explore what computers do and the basic jobs they perform.', 5, 1),
    ('hardware-vs-software', 'Hardware vs Software', 'Learn the difference between the physical parts and the programs they run.', 6, 2),
    ('input-processing-output-storage', 'Input, Processing, Output & Storage', 'Follow how a computer receives, works with, presents, and saves information.', 7, 3),
    ('meet-the-cpu', 'Meet the CPU', 'Discover how the central processing unit follows instructions and coordinates work.', 6, 4),
    ('what-is-ram', 'What Is RAM?', 'See how memory gives the computer quick access to information in use.', 6, 5),
    ('how-storage-works', 'How Storage Works', 'Compare long-term storage with memory and learn where files are kept.', 6, 6),
    ('what-does-a-gpu-do', 'What Does a GPU Do?', 'Learn how a graphics processor helps create images and handle parallel work.', 6, 7),
    ('the-motherboard', 'The Motherboard', 'Understand how the motherboard connects components and lets them communicate.', 7, 8),
    ('ports-and-peripherals', 'Ports & Peripherals', 'Identify common ports and the devices that connect through them.', 7, 9),
    ('operating-systems', 'Operating Systems', 'Find out how an operating system helps people and apps use computer hardware.', 7, 10),
    ('files-and-folders', 'Files & Folders', 'Practice the basic ideas behind naming, organizing, and finding digital files.', 6, 11),
    ('final-mission-meet-the-computer', 'Final Mission: Meet the Computer', 'Review the key parts and ideas from the path in one short wrap-up.', 10, 12)
)
insert into public.lessons (
  path_id,
  slug,
  title,
  summary,
  learning_mode,
  estimated_minutes,
  sort_order,
  is_published
)
select
  computer_basics.id,
  lesson_seed.slug,
  lesson_seed.title,
  lesson_seed.summary,
  'All',
  lesson_seed.estimated_minutes,
  lesson_seed.sort_order,
  true
from computer_basics
cross join lesson_seed
on conflict (path_id, slug) do update
set title = excluded.title,
    summary = excluded.summary,
    learning_mode = excluded.learning_mode,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published;