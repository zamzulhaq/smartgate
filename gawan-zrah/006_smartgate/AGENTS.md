# AGENTS.md: Smart Gate & Manajemen Perumahan

## Proyek
Aplikasi manajemen perumahan (300+ rumah, 4+ gerbang). Warga masuk/keluar dengan tap KTP (UID chip e-KTP), tamu lewat QR, semua tercatat di log. Gerbang HARUS tetap jalan saat internet mati. Dokumen acuan lengkap: PRD v0.2 (jika ada di /docs/PRD.md, baca itu).

## Stack
- Backend: Supabase (Postgres, Auth, RLS, Edge Functions)
- Web admin: Next.js + Tailwind
- App Android (warga + satpam): [Flutter / Expo, isi sesuai keputusan]
- Firmware gerbang: ESP32 + 2x PN532 + relay + RTC DS3231 (PlatformIO/Arduino)
- Notifikasi: Firebase Cloud Messaging

## Struktur repo (usulan, ikuti jika belum ada)
- /supabase   -> migrasi SQL, RLS, edge functions
- /admin-web  -> Next.js
- /mobile     -> app Android
- /firmware   -> kode ESP32
- /docs       -> PRD, PROGRESS.md, wiring

## Aturan kerja (WAJIB)
1. Kerjakan HANYA tugas yang diminta di prompt. Jangan refactor, jangan rename, jangan tambah fitur, jangan ubah file di luar batasan tugas.
2. Pilih solusi paling sederhana yang memenuhi kriteria selesai. Jangan over-engineering, jangan tambah library baru tanpa alasan jelas.
3. Jangan mengganti stack atau arsitektur sendiri. Kalau merasa perlu, laporkan di bagian "belum beres", jangan dikerjakan.
4. Jika ada hal ambigu, ambil asumsi paling masuk akal, tulis asumsinya di laporan, dan lanjut. Jangan berhenti bertanya kecuali benar-benar buntu.
5. Satu tugas = satu commit dengan pesan singkat yang jelas (misal: `feat: tabel cards + RLS`).
6. Jika error tidak teratasi setelah 2 percobaan dengan pendekatan yang sama, BERHENTI dan laporkan: apa yang dicoba, apa errornya, dan 1-2 opsi alternatif.

## Keamanan (tidak boleh dilanggar)
- Tidak ada secret, API key, pepper HMAC, atau password di kode atau repo. Pakai `.env` (sudah di `.gitignore`) dan sediakan `.env.example` tanpa nilai asli.
- UID KTP TIDAK PERNAH disimpan mentah. Simpan sebagai HMAC-SHA256 dengan pepper rahasia, bukan hash polos (UID pendek, mudah di-brute force).
- Tabel `access_logs` insert-only: tidak ada update/delete untuk peran aplikasi mana pun.
- Semua tabel pakai Row Level Security. Warga hanya melihat data rumahnya sendiri. Satpam tidak boleh membaca tabel `cards`.
- Controller ESP32 mengakses server hanya lewat Edge Function dengan device key, tidak langsung ke tabel.
- QR tamu ditandatangani (HMAC/Ed25519) dan memuat masa berlaku, batas pemakaian, dan token_id untuk pencabutan.

## Aturan khusus firmware (gerbang)
- Keputusan buka gerbang untuk tap KTP dibuat LOKAL dari daftar UID di flash (LittleFS). Tidak boleh bergantung pada koneksi internet.
- Relay fail-safe: kegagalan firmware/listrik tidak boleh mengunci gerbang permanen. Jangan membuat relay menahan kondisi tertutup tanpa timeout.
- Durasi aktif relay dibatasi (default beberapa detik), selalu ada timeout.
- Log tap disimpan di antrean lokal dengan nomor urut `device_seq` per perangkat, lalu diunggah batch. Server menolak duplikat via (device_id, device_seq).
- Timestamp memakai RTC, sinkron NTP saat online.
- Jangan hardcode kredensial WiFi/key di kode. Pakai file konfigurasi terpisah yang tidak di-commit.

## Konvensi
- Bahasa kode dan nama tabel/kolom: Inggris atau Indonesia, tapi KONSISTEN dengan yang sudah ada. Ikuti penamaan di PRD bagian 7.
- Teks yang tampil ke pengguna: Bahasa Indonesia.
- Perubahan database selalu lewat file migrasi di /supabase/migrations, bukan edit manual.
- Tulis kode yang mudah dibaca pemula. Komentar singkat hanya untuk logika non-obvious (terutama relay, HMAC, QR).

## Definisi "selesai"
Tugas dianggap selesai bila:
- Memenuhi semua KRITERIA SELESAI di prompt.
- Bisa dijalankan dengan perintah yang kamu tuliskan di laporan.
- Tidak ada secret yang ter-commit.
- Sudah di-commit.
Tidak perlu sempurna. Hal kecil yang belum rapi cukup dicatat, jangan dikerjakan.

## Format laporan setelah tugas selesai (singkat)
1. File yang dibuat/diubah.
2. Cara menjalankan dan mengetes (langkah konkret).
3. Belum beres / asumsi yang diambil (maks 3 baris, boleh kosong).
Tidak perlu penjelasan panjang atau ringkasan ulang kode.

## Perintah umum (isi setelah proyek berjalan)
- Jalankan PostgreSQL lokal: `.\scripts\pg.ps1 start` (127.0.0.1:5433, cluster di `pgdata/`)
- Jalankan web admin: `cd admin-web` lalu `npm run dev` (http://localhost:3000)
- Build web admin: `cd admin-web` lalu `npm run build`
- Kredensial aplikasi: `admin-web/.env.local` (role `smartgate_app`, non-superuser)
- Jalankan migrasi: belum ada (belum ada tabel)
- Build/flash firmware: belum ada
- Jalankan app Android: belum ada