# PROGRESS.md: Smart Gate & Manajemen Perumahan

Status per 2026-10-26. Requirement bisnis tetap mengikuti PRD v0.2 (bagian 7 untuk
desain tabel). Keputusan arsitektur terbaru ada di `AGENTS.md`. Pekerjaan tertunda
dicatat di `docs/BACKLOG.md`.

## Yang sudah selesai

- [x] PostgreSQL lokal 18.4 di `127.0.0.1:5433` (cluster di `pgdata/`, di-gitignore).
      Start/stop lewat `scripts/pg.ps1`. Catatan troubleshoot: `docs/POSTGRES-WINDOWS.md`.
- [x] Role database `smartgate_app` (LOGIN, non-superuser) + RLS per peran; kredensial
      aplikasi di `admin-web/.env.local`, admin/CLI di `.env` (keduanya gitignored).
- [x] Web admin Next.js 16 + Tailwind v4 + TypeScript: login admin, sesi cookie, guard
      API 401/403, dashboard + sidebar.
- [x] Rumah & warga: migrasi `houses`/`residents`, API GET/POST/PUT, UI manajemen.
- [x] Kartu akses: `cards` dengan `uid_hmac` (HMAC-SHA256, `UID_HMAC_SECRET` wajib dari
      environment, tanpa fallback), registrasi via `/kartu`, pencabutan/aktivasi ulang.
- [x] Log akses: `access_points`/`devices`/`access_logs` (insert-only untuk role
      aplikasi), API baca admin, UI `/log-akses`.
- [x] Tamu (MVP tanpa QR): `guests` + `guest_visits`, identifikasi duplikat via HMAC NIK
      (`NIK_HMAC_SECRET` terpisah, wajib, tanpa fallback), registrasi profil + pencatatan
      kunjungan manual di `/tamu`, FK `access_logs.guest_id`.

## Belum dikerjakan

- [ ] Privasi/persetujuan dan retensi data tamu (lihat `docs/BACKLOG.md`).
- [ ] Tap kartu petugas untuk membuka gerbang (integrasi hardware).
- [ ] Akses publik (domain, proxy, TLS): dikerjakan di luar repo ini.
- [ ] App Android (warga + satpam), notifikasi FCM.
- [ ] Firmware gerbang, reader, scanner, MQTT, sinkronisasi offline.

## Langkah berikutnya

Sesuai scope yang disetujui: lanjutkan alur tamu e-KTP (verifikasi satpam) dan
persiapan tap kartu petugas, tanpa QR. Integrasi hardware tetap ditunda.
