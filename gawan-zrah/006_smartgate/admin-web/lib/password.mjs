import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Hash kata sandi dengan scrypt bawaan Node (tanpa dependensi tambahan).
// Format: scrypt$<salt hex>$<hash hex>, salt acak per akun.
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function cekPassword(password, tersimpan) {
  const bagian = String(tersimpan ?? "").split("$");
  if (bagian.length !== 3 || bagian[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(bagian[1], "hex");
    const harapan = Buffer.from(bagian[2], "hex");
    if (harapan.length === 0) return false;
    const hasil = scryptSync(password, salt, harapan.length);
    return timingSafeEqual(hasil, harapan);
  } catch {
    return false;
  }
}
