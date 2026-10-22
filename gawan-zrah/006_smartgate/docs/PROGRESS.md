# PROGRESS.md: Smart Gate & Manajemen Perumahan

Status per 2026-10-22. Requirement bisnis tetap mengikuti PRD v0.2 (bagian 7 untuk
desain tabel). Keputusan arsitektur terbaru ada di `AGENTS.md`.

## Yang sudah selesai

- [x] PostgreSQL lokal 18.4 di `127.0.0.1:5433` (cluster di `pgdata/`, di-gitignore).
      Start/stop lewat `scripts/pg.ps1`. Catatan troubleshoot: `docs/POSTGRES-WINDOWS.md`.
- [x] Role database `smartgate_app` (LOGIN, non-superuser, hak minimum: CONNECT pada
      database `smartgate` + USAGE/CREATE pada schema `public`).
- [x] Kredensial terpisah: `admin-web/.env.local` (role aplikasi) dan `.env`
      (role admin/CLI untuk psql & migrasi). Kedua file gitignored.
- [x] Web admin Next.js 16 + Tailwind v4 + TypeScript di `/admin-web`:
      halaman utama menampilkan "Smart Gate & Manajemen Perumahan" plus status koneksi
      database. `npm run build` dan `npm run lint` bersih.
- [x] Konfigurasi PostgreSQL (`listen_addresses = '127.0.0.1'`, port 5433,
      `shared_buffers = 16MB`) - database tidak dibuka ke jaringan publik.

## Belum dikerjakan

- [ ] Tabel aplikasi: belum ada tabel, belum ada file migrasi.
- [ ] API/backend: belum ada route handler, belum ada autentikasi/role UI.
- [ ] Modul warga, kartu (KTP), tamu, log akses: belum ada.
- [ ] Akses publik (domain, proxy, TLS): ditunda, dikerjakan di luar repo ini.
- [ ] App Android (warga + satpam): ditunda.
- [ ] Firmware gerbang, reader, scanner, MQTT, log tap offline: ditunda.
- [ ] Notifikasi FCM: belum dimulai.

## Langkah berikutnya: Manajemen Data Warga

Tahap pertama dari modul bisnis, sesuai PRD v0.2 bagian 3.1 dan 7:

1. File migrasi SQL untuk tabel `houses` (blok, nomor, status_hunian) dan `residents`
   (house_id, nama, status_keluarga, no_hp, aktif) beserta constraint & index.
2. Jalankan migrasi ke PostgreSQL lokal dengan role admin (dari `.env`), bukan role aplikasi.
3. Halaman admin untuk daftar + tambah/ubah data warga dan rumah di `/admin-web`,
   akses data lewat route handler lokal.
4. Aturan hak akses: role aplikasi hanya untuk aplikasi web; residents hanya bisa
   melihat datanya sendiri (native PostgreSQL RLS) saat modul warga hadir.

Setelah Manajemen Data Warga: kartu/KTP (penyimpanan `uid_hmac` dengan pepper, tidak
pernah UID mentah), lalu mode tamu (QR bertanda tangan), lalu log akses.
