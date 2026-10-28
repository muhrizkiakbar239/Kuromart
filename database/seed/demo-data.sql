-- Kategori awal. Toko dan produk dibuat lewat dashboard seller.
insert into public.categories (slug, name) values
  ('elektronik', 'Elektronik'),
  ('fashion', 'Fashion'),
  ('rumah-tangga', 'Rumah Tangga'),
  ('kecantikan', 'Kecantikan'),
  ('olahraga', 'Olahraga'),
  ('gadget', 'Gadget')
on conflict (slug) do nothing;
