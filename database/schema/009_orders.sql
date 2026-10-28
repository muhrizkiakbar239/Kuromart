create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  buyer_id uuid not null references public.profiles(id),
  status text not null default 'processing' check (status in ('processing', 'shipped', 'completed', 'cancelled')),
  payment_method text not null check (payment_method in ('transfer', 'ewallet', 'cod')),
  shipping_address jsonb not null,
  subtotal bigint not null,
  discount bigint not null default 0,
  shipping_fee bigint not null default 0,
  total bigint not null,
  voucher_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  store_id uuid not null references public.stores(id),
  product_name text not null,
  unit_price bigint not null,
  qty int not null check (qty > 0),
  subtotal bigint not null
);

create index if not exists orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index if not exists order_items_store_idx on public.order_items (store_id);
create index if not exists order_items_order_idx on public.order_items (order_id);
