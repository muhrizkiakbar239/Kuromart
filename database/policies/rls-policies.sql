-- Jalankan setelah semua skema. Server memakai service role sehingga melewati RLS,
-- tetapi kebijakan ini melindungi jika klien mengakses tabel langsung dengan anon key.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;

-- Profil: pengguna hanya bisa membaca dan mengubah data dirinya sendiri, kecuali role.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Kategori: publik dibaca.
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated using (true);

-- Toko: publik membaca toko aktif, pemilik membaca tokonya sendiri.
-- Pemilik tidak boleh mengubah status toko sendiri.
revoke update on public.stores from authenticated, anon;
grant update (name, description) on public.stores to authenticated;

drop policy if exists stores_public_read on public.stores;
create policy stores_public_read on public.stores
  for select to anon, authenticated using (status = 'active');

drop policy if exists stores_owner_read on public.stores;
create policy stores_owner_read on public.stores
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists stores_owner_insert on public.stores;
create policy stores_owner_insert on public.stores
  for insert to authenticated with check (owner_id = auth.uid() and status = 'pending');

drop policy if exists stores_owner_update on public.stores;
create policy stores_owner_update on public.stores
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Produk: publik membaca produk aktif dari toko aktif, seller mengelola produk tokonya.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (
    status = 'active' and exists (
      select 1 from public.stores s where s.id = store_id and s.status = 'active'
    )
  );

drop policy if exists products_owner_read on public.products;
create policy products_owner_read on public.products
  for select to authenticated using (
    exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
  );

drop policy if exists products_owner_write on public.products;
create policy products_owner_write on public.products
  for all to authenticated using (
    exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
  );

-- Storage: bucket gambar produk bersifat publik untuk dibaca.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
