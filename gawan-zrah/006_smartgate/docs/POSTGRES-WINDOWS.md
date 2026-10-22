# PostgreSQL lokal di Windows - diagnosis & cara pakai

Cluster lokal Smart Gate: PostgreSQL 18.4, port **5433**, folder data `pgdata/`.

## Cara menjalankan

```powershell
.\scripts\pg.ps1 start     # start postmaster (detached), tunggu sampai ready
.\scripts\pg.ps1 status    # pg_isready
.\scripts\pg.ps1 stop      # shutdown bersih
.\scripts\pg.ps1 restart
```

Cek manual:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h 127.0.0.1 -p 5433
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U smartgate -h 127.0.0.1 -p 5433 -d smartgate -c "select 1;"
```

## Gejala yang pernah terjadi (2026-10-22)

Dijalankan langsung dari konsol interaktif (`pg_ctl start` di terminal PowerShell):

```
LOG:  could not open file "./server.log": sharing violation
      You might have antivirus, backup, or similar software interfering
LOG:  syncing data directory (fsync), elapsed time: 36.45 s
LOG:  autovacuum worker (PID 18792) was terminated by exception 0xC0000142
LOG:  terminating any other active server processes
LOG:  all server processes terminated; reinitializing
LOG:  could not reserve shared memory region (addr=000002B16D2F0000) for child ...: error code 487
```

Server lalu rusak permanen: postmaster tidak lagi bisa membuat proses anak
(`VirtualAllocEx` di anak baru gagal dengan `error code 487`), jadi `pg_isready`
balas *no response* walau postmaster masih hidup.

## Penyebab

Dua hal yang berbeda, keduanya hilang setelah perubahan startup:

1. **Log PostgreSQL diletakkan di dalam folder data (`pgdata/server.log`).**
   Saat start, PostgreSQL me-*fsync* seluruh isi folder data dan membuka file log
   itu sendiri -> *sharing violation* + fsync 36 detik (indikasi proses lain,
   mis. antivirus, menahan file di folder data).
   Bukti: 84 file log instance *Windows Service* (`C:\Program Files\PostgreSQL\18\data`,
   3 bulan, `logging_collector=on` -> log di luar data dir) **tidak pernah** memuat
   "sharing violation"/"antivirus"/"syncing data directory".

2. **Postmaster dijalankan dari konsol interaktif.**
   Proses anak `postgres.exe` mati dengan `0xC0000142` (`STATUS_DLL_INIT_FAILED`),
   lalu shared memory tidak bisa dialokasikan di anak baru (487).
   Instance *Windows Service* berjalan di session 0 (tanpa konsol interaktif) dan
   **tidak pernah** mengalami itu dengan parameter yang sama
   (`shared_buffers = 128MB`, `max_connections = 100`, `autovacuum_worker_slots = 16`).
  Bug upstream yang mirip: PostgreSQL BUG #18954 (Windows shmem 487) dan
   BUG #6201 (backend mati 0xC0000142).

## Solusi (yang dipakai)

`scripts/pg.ps1` menjalankan `pg_ctl.exe` lewat `Start-Process -WindowStyle Hidden`
dari direktori `bin` PostgreSQL, sehingga postmaster punya konsol sendiri dan tidak
berbagi konsol interaktif. Log ditulis ke `pglogs/postgres.log` (di luar `pgdata/`).
Parameter lain tidak diubah besides `shared_buffers = 16MB` di `pgdata/postgresql.conf`.

## Kalau muncul lagi

- Cek `pglogs/postgres.log` untuk `0xC0000142` / `487`.
- `.\scripts\pg.ps1 stop` lalu `start` (postmaster butuh start ulang agar shared
  memory dialokasikan ulang).
- Opsi lain (butuh akun admin, belum dipakai): jalankan sebagai Windows Service
  seperti instance bawaan, atau nonaktifkan *real-time protection* Defender.
