create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
