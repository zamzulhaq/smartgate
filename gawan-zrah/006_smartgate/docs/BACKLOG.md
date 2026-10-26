# BACKLOG.md: Smart Gate & Manajemen Perumahan

Catatan pekerjaan yang sengaja ditunda. Bukan komitmen jadwal.

## Privasi data tamu (e-KTP)

- [ ] **Dasar pemrosesan & persetujuan:** tambahkan teks pemberitahuan singkat saat
      registrasi tamu (tujuan pemrosesan: keamanan/operasional perumahan, data yang
      disimpan: nama + HMAC NIK, bukan NIK lengkap/foto/biometrik) dan mekanisme
      persetujuan yang tercatat (mis. timestamp/versi kebijakan).
- [ ] **Hak subjek data:** alur permintaan koreksi/penghapusan profil tamu oleh admin.
- [ ] **Akses minimum:** tinjau ulang siapa (admin/satpam) yang boleh melihat nama tamu
      dan riwayat kunjungan; belum ada peran selain admin pada UI saat ini.

## Retensi data

- [ ] Tentukan masa retensi `guests` (profil tamu) dan `guest_visits` (riwayat kunjungan),
      lalu buat job pembersihan/anonymisasi berkala. `access_logs` tetap insert-only;
      penghapusan retensi harus lewat prosedur admin yang tercatat.
- [ ] Dokumentasikan kebijakan retensi untuk `access_logs` dan data tamu di PRD/kebijakan
      operasional.

## Ditunda (hardware/integrasi)

- Scanner NFC/e-KTP, firmware gerbang, MQTT, sinkronisasi offline, dan fungsi buka gerbang.
- OCR e-KTP: tidak direncanakan; input NIK manual oleh admin/satpam.
