import { createHmac } from "crypto";

const PANJANG_MIN_SECRET = 32;

export function normalisasiNik(nik: string): string {
  return nik.replace(/\D/g, "");
}

export function validasiNik(nik: string): boolean {
  return /^\d{16}$/.test(normalisasiNik(nik));
}

function dapatkanSecretNik(): string {
  const secret = process.env.NIK_HMAC_SECRET;
  const s = typeof secret === "string" ? secret.trim() : "";
  if (s.length === 0) {
    throw new Error("NIK_HMAC_SECRET wajib diisi di environment server");
  }
  if (s.length < PANJANG_MIN_SECRET) {
    throw new Error("NIK_HMAC_SECRET terlalu pendek");
  }
  return s;
}

export function hashNikHmac(nik: string): string {
  const secret = dapatkanSecretNik();
  return createHmac("sha256", secret).update(normalisasiNik(nik)).digest("hex");
}
