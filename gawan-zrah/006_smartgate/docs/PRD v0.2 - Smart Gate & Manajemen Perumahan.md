# PRD v0.2: Smart Gate & Manajemen Perumahan

Draft v0.2 · 21 Oktober 2026 · Status: siap dipakai sebagai konteks tetap untuk agent vibe coding

## 1. Ringkasan

Aplikasi untuk mengelola data warga dan rumah di perumahan 300+ rumah, sekaligus mengontrol akses 4+ gerbang lewat **tap KTP (UID chip e-KTP)** dan **undangan tamu (QR)**. Semua pembukaan gerbang tercatat di log keluar-masuk. Gerbang harus tetap berfungsi saat internet mati.

### Tujuan

- Warga terdaftar masuk dan keluar cukup dengan tap KTP.
- Tamu bisa diundang, didaftar tetap (langganan), atau disetujui warga secara langsung lewat notifikasi.
- Pengelola punya data warga dan log akses yang rapi dan bisa diaudit.

### Bukan tujuan (di luar MVP)

- Akses GOR dan gedung serba guna (booking, jam buka, aturan khusus)
- Tagihan IPL, pengaduan, pengumuman
- Aplikasi iOS
- Face recognition, PIN tambahan, kamera di gerbang
- Multi-perumahan (SaaS)

## 2. Pengguna dan peran

| Peran | Platform | Kebutuhan utama |
| --- | --- | --- |
| Admin/pengelola | Web (Next.js) | Kelola data warga/rumah, daftarkan KTP (tap di kantor), kelola gerbang dan reader, lihat log |
| Satpam (1 pos) | HP Android | Scan QR tamu, minta persetujuan warga untuk tamu tanpa undangan, buka gerbang manual, lihat log |
| Warga | HP Android | Buat undangan tamu, daftar tamu langganan, terima notifikasi persetujuan, lihat riwayat tamu |
| Tamu | Tanpa akun | Menerima QR/link dari warga |

Tidak ada pembatasan jam akses berdasarkan status (anak, ART, dst). Status hanya sebagai atribut data.

## 3. Lingkup MVP

### 3.1 Data warga dan rumah

- Rumah: blok, nomor, status hunian (pemilik/kontrak/kosong).
- Warga: nama, no. HP, rumah, status keluarga (kepala keluarga, pasangan, anak, ART, lainnya), aktif/tidak aktif.
- Kendaraan: plat, jenis, rumah.
- Siapa pun yang punya KTP boleh didaftarkan, dengan status yang menjelaskan hubungannya (misalnya "anak").

### 3.2 Akses gerbang tap KTP

- Admin mendaftarkan KTP di kantor pengelola: tap KTP ke reader pendaftaran, sistem menyimpan UID dalam bentuk hash dan menautkannya ke warga.
- Warga tap KTP di gerbang (masuk dan keluar), gerbang terbuka jika KTP aktif.
- Semua gerbang punya aturan sama: semua KTP aktif boleh masuk dan keluar di semua gerbang.
- Pencabutan KTP (hilang, pindah) oleh admin tersinkron ke semua gerbang dalam hitungan menit saat online.

### 3.3 Mode tamu

1. **QR rentang waktu:** warga membuat undangan dengan tanggal mulai dan berakhir (cocok untuk tamu menginap). Maksimal pemakaian bisa diatur.
2. **Tamu langganan:** warga mendaftarkan tamu tetap (kurir, ojol, keluarga) yang bisa dipakai berulang sampai dicabut.
3. **Tamu tanpa undangan:** satpam memasukkan data tamu, sistem mengirim notifikasi ke warga tujuan, warga menyetujui atau menolak, hasilnya muncul di HP satpam.

QR tamu discan oleh satpam lewat HP (bukan scanner di gerbang). Setelah valid, satpam membuka gerbang lewat aplikasi atau tombol manual.

### 3.4 Log keluar-masuk

Setiap kejadian tercatat: siapa, kapan, gerbang mana, arah (masuk/keluar), metode (kartu/QR/manual), hasil (diizinkan/ditolak) dan alasan penolakan, serta siapa yang membuka bila manual. Log tidak bisa diedit atau dihapus lewat aplikasi.

## 4. Arsitektur

```
[Web Admin] ----\
[HP Satpam] -----+--> [Supabase: Postgres + Auth + Realtime + Edge Functions] <--> [FCM notifikasi]
[HP Warga] -----/                         ^
                                          | HTTPS (sync + log) / MQTT (perintah buka manual)
                          [Controller gerbang: ESP32 + 2x PN532 + relay] x 4+
```

### Komponen

- **Backend:** Supabase (Postgres, Auth, Row Level Security, Realtime, Edge Functions).
- **Web admin:** Next.js + Tailwind.
- **App Android:** Flutter atau React Native (Expo). Satu app dengan tampilan berbeda per peran (warga/satpam).
- **Notifikasi:** Firebase Cloud Messaging.
- **Controller gerbang:** ESP32 + 2 reader PN532 (sisi luar untuk masuk, sisi dalam untuk keluar) + relay ke kontak kering motor/palang gerbang. Ditambah tombol manual fisik di pos dan sumber daya cadangan (UPS kecil).
- **Reader pendaftaran:** satu ESP32/PN532 (atau HP Android dengan NFC) yang tersambung ke web admin di kantor pengelola.

### Sinkronisasi offline

- Controller menyimpan daftar UID hash aktif di memori lokal (flash).
- Controller memanggil endpoint sync secara berkala (misalnya tiap 1-2 menit) dengan parameter `since_version`. Server mengembalikan perubahan (kartu baru, dicabut, diaktifkan lagi).
- Log tap disimpan di antrean lokal dengan nomor urut per perangkat, lalu diunggah dalam batch. Server memakai `device_id + seq` sebagai kunci idempotensi supaya tidak ada log ganda.
- Waktu: controller sinkron waktu via NTP saat online, dan memakai RTC (DS3231) agar timestamp log tetap akurat saat offline.
- Kapasitas: 1.500 KTP × beberapa byte hash masih muat dengan nyaman di flash ESP32 (LittleFS).

### Perintah buka manual dari satpam

Melalui MQTT atau polling cepat ke controller. Saat internet mati, satpam memakai **tombol fisik** di pos. Ini harus dibahas dan diuji, bukan diasumsikan.

## 5. Aturan bisnis

1. Tap KTP diizinkan jika UID hash ada di daftar lokal dengan status aktif.
2. Semua tap (diizinkan atau ditolak) masuk log.
3. QR tamu valid jika tanda tangan benar, dalam masa berlaku, belum melebihi batas pemakaian, dan tidak dicabut. Validasi dilakukan satpam via aplikasi (online). Jika internet satpam mati, aplikasi tetap bisa memverifikasi tanda tangan dan masa berlaku secara lokal.
4. Tamu tanpa undangan: permintaan persetujuan kedaluwarsa dalam waktu yang ditentukan (default 3 menit). Jika tidak ada respons, satpam memutuskan manual dan itu tercatat.
5. Relay bersifat **fail-safe**: gerbang tidak boleh terkunci permanen saat listrik/ESP32 mati. Perlu ada jalur manual (kunci fisik, tombol, atau kontrol motor bawaan).
6. Opsional (setelah MVP stabil): **anti-passback**. KTP yang tercatat masuk tidak bisa masuk lagi sebelum tercatat keluar, untuk mendeteksi kartu kloning. Dengan sinkron antar gerbang yang tertunda saat offline, aturan ini bisa menimbulkan penolakan palsu, jadi mulai dengan mode "peringatan saja", bukan menolak.

## 6. Keamanan dan privasi

- **UID bisa dikloning.** UID tanpa autentikasi dapat ditiru dengan alat murah. Ini risiko yang **diterima di MVP**. Mitigasi: log lengkap, deteksi tap janggal (misalnya KTP yang sama masuk dua kali berturut-turut di gerbang berbeda dalam waktu sangat singkat), dan opsi PIN/kamera di fase berikutnya.
- **Hash UID wajib memakai HMAC dengan kunci rahasia (pepper)**, bukan hash biasa. UID hanya 4-7 byte, sehingga hash polos mudah dibobol dengan brute force. Kunci disimpan di server dan di firmware controller (jangan di repo).
- **UU PDP No. 27/2022:** UID yang terhubung ke orang adalah data pribadi. Catat persetujuan warga (`consent_at`) saat pendaftaran, simpan seminimal mungkin, dan sediakan mekanisme penghapusan data saat warga pindah.
- **Role-based access** lewat Row Level Security di Supabase: warga hanya melihat data rumahnya, satpam hanya data operasional, admin penuh.
- **Autentikasi perangkat:** tiap controller punya kunci unik (device key) untuk memanggil API, dan bisa dicabut per perangkat.
- **Rahasia:** semua key di `.env`/secret manager, tidak ada di kode atau repo.
- **Log audit:** tabel log hanya bisa di-insert, tanpa update/delete untuk semua peran aplikasi.
- **Review manusia wajib** untuk kode yang mengatur relay, validasi UID, dan tanda tangan QR.

## 7. Desain database (draft)

Semua tabel memakai `id uuid` sebagai primary key dan `created_at timestamptz`.

| Tabel | Kolom penting | Catatan |
| --- | --- | --- |
| `profiles` | id (= auth.users.id), role (admin/satpam/warga), resident\_id, nama | Satu akun login per orang yang memakai app |
| `houses` | blok, nomor, status\_hunian, catatan | Unik pada (blok, nomor) |
| `residents` | house\_id, nama, status\_keluarga, no\_hp, aktif | Status keluarga: kepala\_keluarga, pasangan, anak, ART, lainnya |
| `vehicles` | house\_id, plat, jenis |  |
| `cards` | resident\_id, uid\_hmac, label, status (aktif/dicabut/hilang), consent\_at, registered\_by, revoked\_at | `uid_hmac` unik. Tidak menyimpan UID mentah |
| `access_points` | nama, tipe (gerbang/gor/gedung), lokasi, aktif | Kolom `tipe` disiapkan agar GOR/gedung bisa ditambah nanti tanpa merombak tabel |
| `devices` | access\_point\_id, arah (masuk/keluar/pendaftaran), device\_key\_hash, last\_seen, last\_sync\_version, firmware | Satu baris per reader |
| `guests` | house\_id, created\_by (resident), nama, tipe (rentang/langganan/tanpa\_undangan), plat, tujuan, berlaku\_dari, berlaku\_sampai, max\_pakai, jumlah\_pakai, status (aktif/dicabut/habis), token\_id | Token QR ditandatangani, `token_id` untuk pencabutan |
| `guest_approvals` | guest\_id, resident\_id, diminta\_oleh (satpam), status (menunggu/disetujui/ditolak/kedaluwarsa), responded\_at | Untuk tamu tanpa undangan |
| `access_logs` | access\_point\_id, device\_id, device\_seq, arah, metode (kartu/qr/manual), card\_id, guest\_id, resident\_id, hasil (diizinkan/ditolak), alasan\_tolak, opened\_by, device\_time, server\_time | Insert-only. Unik pada (device\_id, device\_seq) |
| `sync_state` | versi global (counter naik tiap perubahan kartu/tamu aktif) | Dasar delta sync |
| `audit_logs` | actor\_id, aksi, objek, sebelum, sesudah | Perubahan data oleh admin (daftar/cabut KTP, edit warga) |

### Kebijakan akses (RLS) singkat

- Warga: baca/ubah `guests` dan lihat `access_logs` hanya untuk house\_id miliknya.
- Satpam: baca `guests` aktif, buat `guest_approvals`, baca log terbaru, tidak bisa melihat `cards`.
- Admin: akses penuh kecuali update/delete `access_logs`.
- Controller: hanya lewat Edge Function dengan device key (tidak langsung ke tabel).

## 8. API controller (draft)

- `GET /sync?since=<version>` mengembalikan `{version, cards:[{uid_hmac,status}], guests_active:[...]}`.
- `POST /logs` menerima batch `[{device_seq, device_time, arah, metode, uid_hmac|guest_token, hasil}]`, idempoten.
- `POST /heartbeat` untuk status perangkat (online, versi firmware, versi sync).
- Perintah buka manual: topik MQTT per perangkat, atau polling pendek.
- Pendaftaran KTP: reader pendaftaran mengirim UID ke web admin, server menghitung `uid_hmac` dan menyimpannya.

## 9. Alur utama

1. **Warga masuk:** tap KTP, controller cek daftar lokal, relay aktif beberapa detik, log lokal tersimpan lalu terunggah.
2. **Pendaftaran KTP:** admin membuka form warga, klik "daftarkan KTP", tap KTP di reader, sistem menyimpan hash, lalu tersinkron ke semua gerbang.
3. **Tamu dengan undangan:** warga buat undangan, kirim QR ke tamu, tamu tiba, satpam scan, valid, satpam buka gerbang, tercatat di log.
4. **Tamu tanpa undangan:** satpam isi data dan pilih rumah tujuan, warga dapat notifikasi, warga setuju/tolak, satpam buka gerbang jika disetujui.
5. **Cabut KTP hilang:** admin tandai kartu "hilang", versi sync naik, controller menarik perubahan, KTP ditolak di semua gerbang.
6. **Internet mati:** KTP tetap jalan lewat daftar lokal. QR tamu dan perintah manual dari app bergantung koneksi, jadi satpam memakai tombol fisik.

## 10. Rencana kerja

### Minggu 1: Bukti konsep (target 1 minggu, realistis)

| Hari | Target | Kriteria selesai |
| --- | --- | --- |
| 1 | Tes UID 10-20 KTP dengan PN532 | UID konsisten tiap tap. Jika ada KTP yang UID-nya acak, pendekatan harus dievaluasi ulang |
| 2 | Rakit ESP32 + PN532 + relay | Tap KTP terdaftar (hardcode) membuat relay klik |
| 3 | Supabase: tabel `houses`, `residents`, `cards`, `access_points`, `devices`, `access_logs` + web admin CRUD sederhana | Admin bisa tambah rumah dan warga |
| 4 | Pendaftaran KTP + endpoint sync | Controller menarik daftar UID dari server |
| 5 | Upload log + uji offline | Cabut jaringan, tap tetap membuka, log terunggah saat online |
| 6-7 | Uji coba 1 gerbang, perbaikan bug, dokumentasi wiring | Dokumen hardware dan checklist uji |

### Minggu 2: Aplikasi dan multi-gerbang

- Login dan role (admin, satpam, warga)
- Rakit controller ke-2 sampai ke-4 (reader masuk dan keluar)
- Dashboard log di web admin

### Minggu 3: Mode tamu

- App warga: buat undangan (QR rentang waktu), daftar tamu langganan
- App satpam: scan QR, validasi, tamu tanpa undangan + notifikasi persetujuan
- Pencabutan undangan

### Minggu 4: Pengerasan dan uji lapangan

- Uji beban dan skenario gagal (listrik mati, internet mati, reader error)
- Uji dengan 5-10 rumah dulu, baru seluruh perumahan
- Pelatihan satpam, SOP darurat, backup database
- Review keamanan manual untuk kode relay, sync, dan QR

## 11. Risiko dan validasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| UID e-KTP tidak konsisten/acak pada sebagian KTP | Konsep tap KTP gagal untuk warga tertentu | Tes 10-20 KTP di hari 1, siapkan kartu NFC cadangan |
| Motor gerbang tidak punya input trigger | Perlu ganti/ubah kontroler motor (biaya terbesar) | Cek model motor dan kontak kering sebelum beli hardware |
| KTP dikloning | Orang tak berhak masuk | Log, deteksi tap janggal, PIN/kamera di fase lanjut |
| Listrik/internet mati | Gerbang terkunci atau tidak tercatat | Daftar UID lokal, RTC, UPS, tombol manual |
| Warga iPhone tidak terlayani | Tidak bisa pakai app | Cek persentase iPhone, pertimbangkan PWA setelah MVP |
| Data pribadi bocor | Pelanggaran UU PDP | HMAC UID, RLS, consent, akses minimum |
| Jadwal 1 minggu terlalu ketat | Kualitas turun | Fokus ke bukti konsep, sisanya bertahap |

## 12. Pertanyaan yang masih terbuka

1. Apakah motor/palang gerbang yang ada punya input kontak kering untuk relay?
2. Siapa yang merakit hardware dan wiring (sendiri atau teknisi)?
3. Berapa persen warga yang memakai iPhone?
4. Anggaran hardware dan hosting?
5. Bagaimana satpam membuka gerbang saat internet mati: tombol fisik di pos, atau cukup kunci manual?

## 13. Panduan untuk agent vibe coding

### Konteks tetap (tempel di awal setiap sesi)

> Proyek: aplikasi manajemen perumahan 300+ rumah dengan kontrol 4+ gerbang via tap KTP (UID) dan QR tamu. Stack: Supabase (Postgres, RLS, Edge Functions), Next.js admin web, app Android (Flutter/Expo), controller ESP32 + PN532. Prinsip: gerbang harus jalan offline, UID disimpan sebagai HMAC, log insert-only, tidak ada secret di kode. Baca PRD v0.2 untuk detail.

### Urutan prompt yang disarankan (satu hal per sesi)

1. "Buat migrasi SQL Supabase untuk tabel houses, residents, cards, access\_points, devices, access\_logs sesuai bagian 7 PRD, lengkap dengan constraint dan index. Jangan buat UI dulu."
2. "Tambahkan Row Level Security untuk peran admin, satpam, warga sesuai bagian 7. Buat juga skrip tes yang membuktikan warga tidak bisa melihat data rumah lain."
3. "Buat halaman admin Next.js untuk CRUD rumah dan warga."
4. "Buat Edge Function GET /sync dan POST /logs dengan autentikasi device key dan idempotensi (device\_id, device\_seq)."
5. "Tulis firmware ESP32 (PlatformIO/Arduino) yang membaca PN532, mencocokkan UID HMAC dengan daftar lokal di LittleFS, mengaktifkan relay, menyimpan log di antrean lokal, dan menyinkronkan saat online."
6. "Buat fitur undangan tamu dengan QR bertanda tangan (masa berlaku, batas pemakaian, pencabutan)."
7. "Buat alur tamu tanpa undangan: permintaan satpam, notifikasi FCM ke warga, persetujuan, status realtime."

### Aturan kerja

- Pakai Git dari hari pertama. Commit tiap fitur selesai.
- Minta agent menuliskan langkah tes untuk tiap fitur, dan jalankan sebelum lanjut.
- Review skema database sebelum agent membangun UI di atasnya.
- Kode relay, validasi UID, sinkronisasi, dan tanda tangan QR di-review manusia.
- Jangan biarkan agent menaruh kunci API/pepper di kode.
