import { query } from "@/lib/db";

type BarisDb = {
  database: string;
  pengguna: string;
  versi: string;
};

type Hasil =
  | { ok: true; baris: BarisDb }
  | { ok: false; kode: string };

export default async function DbStatus() {
  let hasil: Hasil;

  try {
    const [baris] = await query<BarisDb>(
      "select current_database() as database, current_user as pengguna, current_setting('server_version') as versi",
    );
    hasil = { ok: true, baris };
  } catch (error) {
    const kode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "tidak diketahui";
    hasil = { ok: false, kode };
  }

  if (!hasil.ok) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Database tidak terhubung</p>
        <p className="mt-1 text-sm text-red-700">Kode error: {hasil.kode}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="font-medium text-emerald-800">Database terhubung</p>
      <p className="mt-1 text-sm text-emerald-700">
        Database: {hasil.baris.database} &middot; Pengguna: {hasil.baris.pengguna} &middot;
        PostgreSQL {hasil.baris.versi}
      </p>
    </div>
  );
}
