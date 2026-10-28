create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);
