-- Toko milik seller. Satu pemilik hanya memiliki satu toko.
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create index if not exists stores_status_idx on public.stores (status);
