# AGENTS.md: Smart Gate & Manajemen Perumahan

## Proyek
Aplikasi manajemen perumahan (300+ rumah, 4+ gerbang). Warga masuk/keluar dengan tap KTP (UID chip e-KTP), tamu lewat QR, semua tercatat di log. Gerbang HARUS tetap jalan saat internet mati. Dokumen acuan lengkap: PRD v0.2 di `/docs/PRD v0.2 - Smart Gate & Manajemen Perumahan.md` (baca itu).

## Stack (keputusan terbaru, 2026-10-22)
- Database: PostgreSQL lokal (18.x) di `127.0.0.1:5433`, cluster di `pgdata/`, dikelola lewat `scripts/pg.ps1`
- Backend/API: server lokal (Next.js route handlers di `/admin-web`), hanya untuk localhost
- Web admin: Next.js 16 + Tailwind v4 + TypeScript (`/admin-web`)
- Akses publik: domain + proxy + TLS dikerjakan terpisah nanti
- App Android (warga + satpam), firmware gerbang (ESP32/PN532/relay), scanner: DITUNDA, belum ada kodenya
- Notifikasi FCM: belum dimulai (ikut tahap setelah modul warga)

PRD v0.2 tetap acuan requirement bisnis. Yang berubah hanya di mana backend-nya berjalan.

## Keputusan arsitektur (2026-10-22)
1. PostgreSQL lokal port 5433 menggantikan Supabase. Tidak ada Supabase Auth/Edge
   Functions sekarang; penggantinya role PostgreSQL biasa + API lokal (route handlers).
2. Database hanya `listen_addresses = '127.0.0.1'` - TIDAK dibuka ke jaringan publik.
3. Backend/API jalan di server lokal (Next.js route handlers). Akses publik lewat
   domain dikerjakan di luar repo ini nanti.
4. Integrasi scanner dan gerbang ditunda: belum ada firmware ESP32, reader, MQTT,
   maupun log tap offline. Modul hardware baru dikerjakan setelah modul warga.
5. Modul bisnis (warga, kartu, tamu, log akses) tetap mengikuti PRD v0.2 bagian 7.

## Struktur repo (usulan, ikuti jika belum ada)
- /admin-web  -> Next.js (web admin + API lokal) [ADA]
- /pgdata     -> cluster PostgreSQL lokal, gitignored [ADA]
- /scripts    -> pg.ps1 (kontrol PostgreSQL lokal) [ADA]
- /docs       -> PRD, PROGRESS.md, wiring
- /mobile     -> app Android (belum, ditunda)
- /firmware   -> kode ESP32 (belum, ditunda)
- /supabase   -> tidak dipakai lagi (Supabase ditunda)

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
- Controller ESP32 mengakses server hanya lewat endpoint API dengan device key, tidak langsung ke tabel.
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
- Perubahan database selalu lewat file migrasi SQL yang di-commit di repo, bukan edit manual.
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