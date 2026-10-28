# KUROMART

Marketplace multi-toko dengan Node.js (Express), Supabase (PostgreSQL, Auth, Storage), dan frontend HTML, CSS, serta JavaScript modul tanpa framework.

## Fitur
- Katalog dengan pencarian, filter kategori, dan pengurutan
- Keranjang, checkout atomik, voucher, dan riwayat pesanan
- Batalkan pesanan, tandai selesai, dan nomor resi
- Ulasan produk setelah pesanan selesai
- Favorit, notifikasi, dan verifikasi role (customer, seller, owner)
- Dashboard seller (produk dan pesanan) dan dashboard owner (ringkasan, persetujuan toko, voucher)

## Menjalankan lokal
1. Pasang Node.js 18 atau lebih baru.
2. Jalankan SQL dari `database/` sesuai urutan di `docs/deployment.md`.
3. Salin `.env.example` menjadi `.env` dan isi kunci Supabase.
4. `npm install`, lalu `npm test`, lalu `npm start`.
5. Buka http://localhost:3000

## Deploy
Panduan lengkap GitHub, Supabase, dan Vercel ada di `docs/deployment.md`.

## Dokumentasi
- `docs/setup-local.md`: setup lokal
- `docs/database.md`: urutan SQL dan membuat owner
- `docs/architecture.md`: arsitektur
- `docs/api.md`: daftar endpoint
- `docs/deployment.md`: deploy ke GitHub, Supabase, dan Vercel

## Catatan
Pembayaran masih mode demo. Pengiriman memakai input kurir dan nomor resi manual, belum terintegrasi dengan ekspedisi.
