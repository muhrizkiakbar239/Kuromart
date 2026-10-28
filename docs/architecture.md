# Arsitektur

Frontend memakai HTML, CSS, dan JavaScript modul tanpa framework. Setiap halaman memuat satu skrip utama di `public/assets/js/pages/` yang memakai komponen bersama dari `components/` dan modul inti dari `core/`.

Pada fase 1, `core/api.js` membaca data demo dari `core/demo-data.js`. Pada fase 2, fungsi di file tersebut akan diganti dengan pemanggilan REST ke `/api` yang didukung Express dan Supabase, sehingga halaman tidak perlu diubah.

Keranjang disimpan di localStorage melalui `core/cart.js`. Pada fase berikutnya keranjang akan dipindahkan ke server untuk pengguna yang sudah login.
