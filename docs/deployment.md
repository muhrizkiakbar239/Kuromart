# Deploy: GitHub, Supabase, Vercel

Urutan yang disarankan: Supabase dulu (untuk mendapat kunci), lalu GitHub, lalu Vercel.

## 1. Supabase

1. Buat project baru di supabase.com. Catat password database.
2. Buka SQL Editor, lalu jalankan file berikut secara berurutan:
   - `database/schema/001_profiles.sql`
   - `database/schema/003_stores.sql`
   - `database/schema/004_categories.sql`
   - `database/schema/005_products.sql`
   - `database/policies/rls-policies.sql`
   - `database/seed/demo-data.sql`
   - `database/schema/009_orders.sql`
   - `database/schema/010_wishlists.sql`
   - `database/schema/011_shipments.sql`
   - `database/schema/012_reviews.sql`
   - `database/schema/013_vouchers.sql`
   - `database/schema/016_notifications.sql`
   - `database/functions/create-order.sql`
   - `database/policies/rls-phase3.sql`
   - `database/policies/rls-phase4.sql`
   - `database/seed/demo-vouchers.sql` (opsional)
3. Buka Project Settings > API. Salin `Project URL`, `anon public key`, dan `service_role key`.
4. Di Authentication > Providers > Email, matikan "Confirm email" jika ingin pendaftaran langsung aktif. Kode saat ini sudah membuat akun dengan email terkonfirmasi, jadi langkah ini opsional.

Peringatan: `service_role key` hanya boleh ada di server (Vercel environment variables dan file `.env` lokal). Jangan pernah menaruhnya di frontend atau di repositori.

## 2. GitHub

1. Buat repositori baru, misalnya `kuromart`, lalu pilih visibilitas private jika ingin.
2. Di folder proyek, jalankan:

       git init
       git add .
       git commit -m "KUROMART fase 4"
       git branch -M main
       git remote add origin https://github.com/USERNAME/kuromart.git
       git push -u origin main

3. Pastikan `.env` tidak ikut ter-push. File `.gitignore` sudah mengecualikannya. Cek dengan `git status` sebelum commit.
4. Workflow CI di `.github/workflows/ci.yml` akan berjalan otomatis dan menjalankan tes.

## 3. Vercel

1. Di vercel.com, pilih Add New > Project, lalu impor repositori GitHub tadi.
2. Framework Preset: Other. Build Command dan Output Directory sudah diatur di `vercel.json`, jadi biarkan default.
3. Di Environment Variables, tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PRODUCT_BUCKET` = `product-images`
   (Variabel `PORT` tidak diperlukan di Vercel.)
4. Klik Deploy. Setelah selesai, buka URL yang diberikan dan cek `/api/health`.

Catatan: `server.js` hanya dipakai saat menjalankan lokal. Di Vercel, Express dijalankan lewat `api/index.js`. Gambar produk diunggah ke Supabase Storage, jadi tidak perlu menyimpan file di server.

## 4. Membuat owner pertama

Daftar akun lewat halaman Daftar, lalu di Supabase SQL Editor jalankan:

    update public.profiles set role = 'owner' where id = 'UUID_AKUN_ANDA';

UUID ada di Authentication > Users.

## Sebelum go-live

- Ganti data demo produk dengan produk nyata lewat dashboard seller.
- Hubungkan domain sendiri di Vercel (Settings > Domains).
- Jika kunci pernah terlihat di chat, repositori, atau tangkapan layar, putar ulang (rotate) di Supabase lalu perbarui environment variables di Vercel.
- Pembayaran masih mode demo. Hubungkan gateway pembayaran sungguhan sebelum menerima uang nyata.
