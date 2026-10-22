import { NextResponse } from "next/server";
import { kodeError, query } from "@/lib/db";
import { STATUS_KELUARGA, type StatusKeluarga, type Warga } from "@/lib/types";

// Keamanan: belum ada autentikasi admin. Endpoint ini hanya untuk pengujian
// lokal; server dibatasi ke 127.0.0.1 (script "dev"/"start" di package.json).
// localhost BUKAN autentikasi dan TIDAK boleh dianggap pengaman - jangan buka
// ke internet sebelum ada login dan otorisasi.

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    const rows = await query<Warga>(
      "select id, house_id, nama, status_keluarga, no_hp, aktif from residents order by nama",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar warga" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const houseId = typeof data.house_id === "string" ? data.house_id.trim() : "";
  const nama = typeof data.nama === "string" ? data.nama.trim() : "";
  const status = data.status_keluarga;
  const noHp = typeof data.no_hp === "string" ? data.no_hp.trim() : "";

  if (!POLA_UUID.test(houseId)) {
    return NextResponse.json({ error: "Pilih rumah yang terdaftar" }, { status: 400 });
  }
  if (!nama) {
    return NextResponse.json({ error: "Nama warga wajib diisi" }, { status: 400 });
  }
  if (!STATUS_KELUARGA.includes(status as StatusKeluarga)) {
    return NextResponse.json({ error: "Status keluarga tidak dikenal" }, { status: 400 });
  }

  try {
    const rows = await query<Warga>(
      "insert into residents (house_id, nama, status_keluarga, no_hp, aktif) values ($1, $2, $3, $4, $5) returning id, house_id, nama, status_keluarga, no_hp, aktif",
      [houseId, nama, status, noHp || null, typeof data.aktif === "boolean" ? data.aktif : true],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23503") {
      return NextResponse.json({ error: "Rumah tidak ditemukan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambah warga" }, { status: 500 });
  }
}
