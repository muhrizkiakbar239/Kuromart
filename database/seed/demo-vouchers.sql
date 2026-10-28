insert into public.vouchers (code, type, value, min_subtotal, max_discount, usage_limit, ends_at) values
  ('SELAMATDATANG', 'percent', 10, 100000, 50000, 500, now() + interval '90 days'),
  ('HEMAT25K', 'fixed', 25000, 200000, null, 200, now() + interval '60 days')
on conflict (code) do nothing;
