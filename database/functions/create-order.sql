-- Checkout atomik: validasi stok, hitung harga dari database, terapkan voucher,
-- simpan pesanan, kurangi stok, dan kirim notifikasi. Semua dalam satu transaksi.
create or replace function public.create_order(
  p_buyer uuid,
  p_items jsonb,
  p_address jsonb,
  p_method text,
  p_voucher text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  it jsonb;
  prod record;
  vch record;
  v_order uuid;
  v_subtotal bigint := 0;
  v_discount bigint := 0;
  v_shipping bigint := 15000;
  v_total bigint;
  v_code text := null;
  v_seen uuid[] := '{}';
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from public.products where id = (it->>'productId')::uuid for update;
    if not found or prod.status <> 'active' then
      raise exception 'Ada produk yang sudah tidak tersedia';
    end if;
    if prod.stock < (it->>'qty')::int then
      raise exception 'Stok % tidak mencukupi', prod.name;
    end if;
    v_subtotal := v_subtotal + prod.price * (it->>'qty')::int;
  end loop;

  if p_voucher is not null and p_voucher <> '' then
    select * into vch from public.vouchers
    where code = upper(p_voucher) and active
      and starts_at <= now() and (ends_at is null or ends_at > now())
    for update;
    if not found then raise exception 'Voucher tidak valid atau sudah kedaluwarsa'; end if;
    if vch.usage_limit is not null and vch.used_count >= vch.usage_limit then
      raise exception 'Kuota voucher sudah habis';
    end if;
    if v_subtotal < vch.min_subtotal then
      raise exception 'Belanja minimal belum tercapai untuk voucher ini';
    end if;
    if vch.type = 'percent' then v_discount := v_subtotal * vch.value / 100;
    else v_discount := vch.value;
    end if;
    if vch.max_discount is not null then v_discount := least(v_discount, vch.max_discount); end if;
    v_discount := least(v_discount, v_subtotal);
    update public.vouchers set used_count = used_count + 1 where id = vch.id;
    v_code := vch.code;
  end if;

  if v_subtotal >= 500000 then v_shipping := 0; end if;
  v_total := v_subtotal - v_discount + v_shipping;

  insert into public.orders (code, buyer_id, payment_method, shipping_address, subtotal, discount, shipping_fee, total, voucher_code)
  values (
    'KM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
    p_buyer, p_method, p_address, v_subtotal, v_discount, v_shipping, v_total, v_code
  )
  returning id into v_order;

  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from public.products where id = (it->>'productId')::uuid;
    insert into public.order_items (order_id, product_id, store_id, product_name, unit_price, qty, subtotal)
    values (v_order, prod.id, prod.store_id, prod.name, prod.price, (it->>'qty')::int, prod.price * (it->>'qty')::int);
    update public.products
      set stock = stock - (it->>'qty')::int, sold = sold + (it->>'qty')::int, updated_at = now()
      where id = prod.id;
    if not (prod.store_id = any(v_seen)) then
      v_seen := v_seen || prod.store_id;
      insert into public.notifications (user_id, title, body)
      select s.owner_id, 'Pesanan baru', 'Ada pesanan baru untuk tokomu. Cek daftar pesanan seller.'
      from public.stores s where s.id = prod.store_id;
    end if;
  end loop;

  insert into public.notifications (user_id, title, body)
  values (p_buyer, 'Pesanan dibuat', 'Pesananmu sudah kami terima dan sedang diproses.');

  return v_order;
end;
$$;
