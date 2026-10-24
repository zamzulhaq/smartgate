import { createHmac } from "crypto";

function dapatkanSecret() {
  const secret = process.env.UID_HMAC_SECRET;
  if (secret && secret.trim() !== "") return secret.trim();
  // Fallback hanya untuk pengujian lokal di lingkungan ini.
  // Di lingkungan lain, wajib pakai UID_HMAC_SECRET di .env.
  return "smartgate-lokal-dev-uid-hmac";
}

export function normalisasiUid(uid: string): string {
  // Normalisasi: hapus spasi/pemisah umum, ubah ke huruf besar (heks)
  return uid.replace(/[\s:.-]/g, "").toUpperCase();
}

export function validasiUid(uid: string): boolean {
  const n = normalisasiUid(uid);
  // UID e-KTP/PN532 umumnya 4-10 byte (8-20 hex char). Izinkan 8-32 hex.
  return /^[0-9A-F]{8,32}$/.test(n);
}

export function hashUidHmac(uid: string): string {
  const n = normalisasiUid(uid);
  const h = createHmac("sha256", dapatkanSecret()).update(n).digest("hex");
  return h;
}
