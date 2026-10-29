# Cara Menjalankan Smart Gate & Manajemen Perumahan

Panduan ini buat jalanin sistem dari awal (Database PostgreSQL lokal + Website Admin) di Windows.

> Repo: `D:\File Azzam\gawan-zrah\006_smartgate`  
> DB: PostgreSQL lokal di `127.0.0.1:5433` (cluster ada di `pgdata/`)  
> Web Admin: Next.js di folder `admin-web/`

## 1. Prasyarat
- Node.js + npm terpasang
- PostgreSQL 18 terinstall (dipakai buat cluster lokal di repo ini)
- Sudah ada file `.env` (root) dan `admin-web/.env.local` (keduanya **di-gitignore**)

## 2. Nyalain Database PostgreSQL lokal

Buka PowerShell di root repo.

```powershell
cd "D:\File Azzam\gawan-zrah\006_smartgate"
.\scripts\pg.ps1 start
```

Cek status biar yakin udah nyala:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h 127.0.0.1 -p 5433
```

Hasil normal: `127.0.0.1:5433 - accepting connections`

Kalau mau matiin nanti:

```powershell
.\scripts\pg.ps1 stop
```

## 3. Nyalain Website Admin (Next.js)

### A. Build dulu (rekomendasi biar stabil)
```powershell
cd "D:\File Azzam\gawan-zrah\006_smartgate\admin-web"
npm run build
```

### B. Jalankan di semua jaringan (biar bisa dibuka dari IP lain)
Biar bisa diakses dari HP/laptop lain di jaringan yang sama, kita bind ke `0.0.0.0`.

Buka PowerShell baru di folder `admin-web`:

```powershell
cd "D:\File Azzam\gawan-zrah\006_smartgate\admin-web"
npx --yes kill-port 3000
npm run start -- --hostname 0.0.0.0 --port 3000
```

> **Catatan:** `npm run dev` juga bisa dipake, tapi buat "coba nyalain" mending `npm run start` hasil build biar mirip kondisi demo.

## 4. Akses Website

Dari laptop ini:

- `http://127.0.0.1:3000`
- `http://localhost:3000`

Dari perangkat lain di jaringan WiFi/LAN yang sama (HP, laptop lain):

- `http://10.109.104.89:3000`
- `http://100.107.34.65:3000`
- `http://192.168.56.1:3000`

Pilih salah satu IP yang **bisa reach** dari perangkat kamu. Biasanya yang dipake WiFi rumah/kampus itu `10.109.104.89` atau `100.107.34.65`.

## 5. Akun Uji

Coba login pakai akun yang udah ada:

- **Admin:** `admin@smartgate.local`
- **Satpam:** `satpam@smartgate.local`

Password ada di catatan lokal (jangan di-commit).

## 6. Troubleshooting Singkat

| Masalah | Solusi |
| --- | --- |
| `connection refused` / website gabisa connect DB | Pastikan PostgreSQL udah jalan di `127.0.0.1:5433`. Cek `pg_isready`. |
| Gak bisa dibuka dari HP | Pastikan Next.js jalan dengan `--hostname 0.0.0.0`. Cek firewall Windows (bolehin Node.js/Next.js). |
| Port 3000 dipake | `npx --yes kill-port 3000` lalu jalankan lagi. |
| Ada error env | Pastikan `admin-web/.env.local` ada isinya (DATABASE_URL buat role `smartgate_app`). |

## Quick Start (1 baris per terminal)

**Terminal 1 (Database)**
```powershell
cd "D:\File Azzam\gawan-zrah\006_smartgate"; .\scripts\pg.ps1 start
```

**Terminal 2 (Website)**
```powershell
cd "D:\File Azzam\gawan-zrah\006_smartgate\admin-web"; npx --yes kill-port 3000; npm run build; npm run start -- --hostname 0.0.0.0 --port 3000
```
