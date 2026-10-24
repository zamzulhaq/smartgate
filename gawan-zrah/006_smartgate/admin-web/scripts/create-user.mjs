// Membuat / memperbarui akun admin, satpam, atau warga.
// Dijalankan manual oleh pengelola (bukan pendaftaran publik).
//
// Pakai:
//   $env:AUTH_NEW_PASSWORD="kata-sandi-baru"
//   node scripts/create-user.mjs --email admin@contoh.local --role admin --nama "Admin"
//
// Koneksi memakai ADMIN_DATABASE_URL dari .env root (role admin/CLI).

import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { hashPassword } from "../lib/password.mjs";

const PERAN = ["admin", "satpam", "warga"];

const args = process.argv.slice(2);
function arg(nama) {
  const i = args.indexOf(`--${nama}`);
  return i >= 0 ? args[i + 1] : undefined;
}

const email = arg("email")?.trim().toLowerCase();
const role = arg("role") ?? "admin";
const nama = arg("nama") ?? email;
const password = process.env.AUTH_NEW_PASSWORD;

if (!email || !password) {
  console.error(
    'Pakai: $env:AUTH_NEW_PASSWORD="..." ; node scripts/create-user.mjs --email admin@contoh.local --role admin --nama "Admin"',
  );
  process.exit(1);
}
if (!PERAN.includes(role)) {
  console.error(`--role harus salah satu: ${PERAN.join(", ")}`);
  process.exit(1);
}

function bacaEnv(path) {
  const hasil = {};
  for (const baris of readFileSync(path, "utf8").split("\n")) {
    const cocok = baris.match(/^([A-Z0-9_]+)=(.*)$/);
    if (cocok) hasil[cocok[1]] = cocok[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return hasil;
}

const urlEnv =
  process.env.ADMIN_DATABASE_URL ?? bacaEnv(new URL("../../.env", import.meta.url)).ADMIN_DATABASE_URL;

if (!urlEnv) {
  console.error("ADMIN_DATABASE_URL tidak ditemukan di environment atau .env root");
  process.exit(1);
}

const pool = new Pool({ connectionString: urlEnv });
try {
  const hasil = await pool.query(
    `insert into profiles (email, password_hash, role, nama)
     values ($1, $2, $3, $4)
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           role = excluded.role,
           nama = excluded.nama
     returning id, email, role`,
    [email, hashPassword(password), role, nama],
  );
  const akun = hasil.rows[0];
  console.log(`Akun tersimpan: ${akun.email} (peran: ${akun.role})`);
} finally {
  await pool.end();
}
