create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value bigint not null check (value > 0),
  min_subtotal bigint not null default 0,
  max_discount bigint,
  usage_limit int,
  used_count int not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
