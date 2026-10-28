create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id int not null references public.categories(id),
  name text not null check (char_length(name) between 3 and 120),
  slug text not null unique,
  description text not null default '',
  price bigint not null check (price >= 100),
  compare_at bigint check (compare_at is null or compare_at >= 0),
  stock int not null default 0 check (stock >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  image_url text,
  sold int not null default 0,
  rating numeric(2, 1) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_store_idx on public.products (store_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
