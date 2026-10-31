# Stitch Integration Map (GatePro Smart Access)

Dokumen ini hanya untuk referensi. **Tidak ada file admin-web yang diubah**.

## Lokasi Referensi
- Folder: `stitch-reference/`
- Berisi hasil ekspor Google Stitch: `gatepro-smart-access.zip` + source React + Vite di `src/`
- Tidak diintegrasikan ke Next.js. Hanya untuk audit mapping.

## Struktur Stitch (ringkas)
- `src/App.tsx` (SPA dengan state lokal, mock data)
- `src/components/`: `Sidebar.tsx`, `Header.tsx`, `LoginScreen.tsx`, `DashboardScreen.tsx`, `RumahWargaScreen.tsx`, `ManajemenTamuScreen.tsx`, `KartuAksesScreen.tsx`, `LogAksesScreen.tsx`, `EmergencyBarrierModal.tsx`, `Toast.tsx`
- `src/data/mockData.ts` (data dummy)
- `src/utils/sound.ts`
- `src/types.ts`

## Mapping ke halaman admin-web yang ada
| Screen Stitch | Halaman Next.js | Status |
|---|---|---|
| LoginScreen | `/` (login box + session) | Sudah ada. Jangan pakai login mock Stitch (hardcoded/demo). Pakai `POST /api/auth/login` + cookie. |
| DashboardScreen (+ Header/Sidebar) | `/` (dashboard) | Sudah ada + sudah di-redesign (AppShell). |
| RumahWargaScreen | `/rumah-warga` | Sudah ada. Pindah UI harus pakai data dari API/DB, bukan `mockData`. |
| ManajemenTamuScreen | `/tamu` (check-in tunggal) | Sudah ada (alur disederhanakan). Pertahankan deteksi NIK HMAC & pembatasan satpam. |
| KartuAksesScreen | `/kartu` | Sudah ada. Wajib pakai `uid_hmac` yang ada. |
| LogAksesScreen | `/log-akses` | Sudah ada. Wajib tetap insert-only (access_logs). Jangan bawa log simulasi. |

## Fungsi mock yang harus dibuang/diganti
| Item Stitch | Risiko | Tindakan |
|---|---|---|
| `mockData.ts` | Sumber data palsu | Buang. Pakai `query`/`queryAs` ke PostgreSQL + API route handlers. |
| `LoginScreen` mock + auto-login | Auth palsu | Buang. Gunakan auth/session server yang ada. |
| `EmergencyBarrierModal` (palang/sirine/log simulasi) | Kontrol gerbang simulasi | Jangan integrasikan. Catat di backlog kalau dibutuhkan (scope terpisah). |
| `sound.ts` | Efek simulasi | Hanya jika ada kebutuhan nyata. |
| State lokal operasional | Pengganti DB | Ganti dengan fetch ke API asli/server component. |
| Password/email demo hardcoded | Kredensial demo | Hilangkan. Hanya pakai akun nyata. |

## Dependensi yang benar-benar diperlukan
- `lucide-react` (sudah ada)
- Tailwind CSS v4 (sudah ada)
- Komponen UI dari Task #13A
- Jangan bawa `@google/genai`, `express`, `motion`, `esbuild`, `tsx` ke admin-web tanpa kebutuhan jelas.

## Risiko Integrasi
- Auth bypass, data mix (mock vs DB), role leak, paparan NIK/UID/HMAC, bypass constraint (buka gerbang/waktu pulang).
- Jangan menimpa file asli; hanya adopsi bertahap.

## Urutan integrasi bertahap
1. Layout via AppShell (sudah ada) tanpa adopsi seluruh komponen
2. Komponen presentasional murni
3. Per halaman dengan verifikasi role + API asli
4. `npm run build` + tes 401/403/RLS/insert-only
5. Hapus referensi mock

## Catatan
- EmergencyBarrierModal dikecualikan.
- NIK hanya dipakai untuk deteksi duplikat HMAC di server.
- Pembatasan role admin/satpam tetap wajib.
