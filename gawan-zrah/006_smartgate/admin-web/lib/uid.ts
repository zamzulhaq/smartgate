import { createHmac } from "crypto";

const PANJANG_MIN_SECRET = 32;

function ambilSecret() {
  const secret = process.env.UID_HMAC_SECRET;
  if (typeof secret !== "string") return null;
  const s = secret.trim();
  if (s.length === 0) return null;
  return s;
}

export function dapatkanSecretUntukHmac(): string {
  const secret = ambilSecret();
  if (!secret) {
    throw new Error("UID_HMAC_SECRET wajib diisi di environment server");
  }
  if (secret.length < PANJANG_MIN_SECRET) {
    throw new Error("UID_HMAC_SECRET terlalu pendek");
  }
  return secret;
}

export function normalisasiUid(uid: string): string {
  return uid.replace(/[\s:.-]/g, "").toUpperCase();
}

export function validasiUid(uid: string): boolean {
  const n = normalisasiUid(uid);
  return /^[0-9A-F]{8,32}$/.test(n);
}

export function hashUidHmac(uid: string): string {
  const secret = dapatkanSecretUntukHmac();
  const n = normalisasiUid(uid);
  const h = createHmac("sha256", secret).update(n).digest("hex");
  return h;
}
