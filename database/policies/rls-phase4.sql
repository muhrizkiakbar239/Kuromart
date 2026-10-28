alter table public.wishlists enable row level security;

drop policy if exists wishlists_own on public.wishlists;
create policy wishlists_own on public.wishlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
