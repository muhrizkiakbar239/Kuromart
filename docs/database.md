# Database

Urutan menjalankan SQL di Supabase SQL Editor:

1. `database/schema/001_profiles.sql`
2. `database/schema/003_stores.sql`
3. `database/schema/004_categories.sql`
4. `database/schema/005_products.sql`
5. `database/policies/rls-policies.sql`
6. `database/seed/demo-data.sql`

Membuat owner pertama: daftar akun lewat aplikasi, lalu jalankan di SQL Editor:

    update public.profiles set role = 'owner' where id = 'UUID_AKUN_ANDA';

Seller mengajukan toko lewat halaman "Jadi seller". Owner menyetujui dengan endpoint `PATCH /api/stores/owner/:id/approve`, yang otomatis mengubah role pemilik toko menjadi seller.
