-- Jalankan setelah rls-policies.sql dan file skema fase 3.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.vouchers enable row level security;
alter table public.notifications enable row level security;

drop policy if exists orders_buyer_read on public.orders;
create policy orders_buyer_read on public.orders for select to authenticated using (buyer_id = auth.uid());

drop policy if exists order_items_buyer_read on public.order_items;
create policy order_items_buyer_read on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

drop policy if exists order_items_seller_read on public.order_items;
create policy order_items_seller_read on public.order_items for select to authenticated using (
  exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
);

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select to anon, authenticated using (true);

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid());

grant update (is_read) on public.notifications to authenticated;
drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
