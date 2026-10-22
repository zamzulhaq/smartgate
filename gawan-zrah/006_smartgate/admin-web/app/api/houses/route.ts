import { NextResponse } from "next/server";
import { kodeError, query } from "@/lib/db";
import { STATUS_HUNIAN, type Rumah, type StatusHunian } from "@/lib/types";

// Keamanan: belum ada autentikasi admin. Endpoint ini hanya untuk pengujian
// lokal; server dibatasi ke 127.0.0.1 (script "dev"/"start" di package.json).
// localhost BUKAN autentikasi dan TIDAK boleh dianggap pengaman - jangan buka
// ke internet sebelum ada login dan otorisasi.

export async function GET() {
  try {
    const rows = await query<Rumah>(
      "select id, blok, nomor, status_hunian, catatan from houses order by blok, nomor",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar rumah" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const blok = typeof data.blok === "string" ? data.blok.trim() : "";
  const nomor = typeof data.nomor === "string" ? data.nomor.trim() : "";
  const status = data.status_hunian;
  const catatan = typeof data.catatan === "string" ? data.catatan.trim() : "";

  if (!blok || !nomor) {
    return NextResponse.json({ error: "Blok dan nomor rumah wajib diisi" }, { status: 400 });
  }
  if (!STATUS_HUNIAN.includes(status as StatusHunian)) {
    return NextResponse.json({ error: "Status hunian tidak dikenal" }, { status: 400 });
  }

  try {
    const rows = await query<Rumah>(
      "insert into houses (blok, nomor, status_hunian, catatan) values ($1, $2, $3, $4) returning id, blok, nomor, status_hunian, catatan",
      [blok, nomor, status, catatan || null],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23505") {
      return NextResponse.json(
        { error: "Rumah dengan blok dan nomor yang sama sudah ada" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal menambah rumah" }, { status: 500 });
  }
}
