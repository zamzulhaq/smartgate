# SmartGate NFC Reader POC

Aplikasi Android minimal untuk proof of concept pembacaan NFC tag/kartu.

## Tujuan
- Hanya mendeteksi tag NFC yang kompatibel
- Menampilkan UID/ID hasil baca sementara
- Menampilkan jenis teknologi NFC yang terdeteksi
- Tidak menyimpan permanen, tidak kirim ke server, tidak kontrol gerbang

## Persyaratan
- Android dengan NFC
- Android Studio atau Gradle
- Min SDK 21, Target SDK 34

## Build & Install
```bash
cd android-nfc-poc
./gradlew assembleDebug
```
APK: `app/build/outputs/apk/debug/app-debug.apk`

Pasang via `adb install` atau langsung dari file manager.

## Cara Tes
1. Aktifkan NFC di pengaturan Android
2. Buka aplikasi SmartGate NFC POC
3. Tempelkan kartu NFC/Mifare atau e-KTP ke belakang perangkat
4. UID dan teknologi akan tampil di layar
5. Ulangi beberapa kali untuk cek konsistensi

## Catatan
- Tidak membaca biodata terlindungi e-KTP
- Beberapa e-KTP mungkin tidak kompatibel untuk pembacaan dasar
- Hanya baca info tag lokal, tidak ada backend
- Tidak ada penyimpanan permanen
