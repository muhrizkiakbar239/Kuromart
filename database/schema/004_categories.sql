create table if not exists public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
