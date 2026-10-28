# Setup lokal

1. Instal Node.js 18 atau lebih baru.
2. Buat proyek di Supabase, lalu jalankan SQL dari `database/` sesuai urutan di `docs/database.md`.
3. Salin `.env.example` menjadi `.env` dan isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` dari menu Project Settings > API.
4. Di folder proyek, jalankan `npm install`.
5. Jalankan `npm start` dan buka http://localhost:3000.

Jangan pernah membagikan `SUPABASE_SERVICE_ROLE_KEY` ke frontend atau repositori publik.

Pada Windows, gunakan PowerShell atau Command Prompt. Jika `npm` tidak dikenali, pasang ulang Node.js dan centang opsi PATH.
